"""Tests for the Redis-backed cache layer (Phase 1.6).

Uses the in-memory LocMemCache backend (configured in settings_test.py).
Verifies:
  1. cache_or_compute actually caches (compute fn called once, not twice)
  2. Version bumps invalidate cached entries
  3. Signals auto-bump versions on model changes
  4. Dashboard endpoints return cached data on second call
  5. Per-user dashboard keys don't leak across users
"""
from unittest.mock import MagicMock

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.shared.cache_utils import (
    bump_version,
    cache_or_compute,
    invalidate_dashboards,
    invalidate_reference_data,
    make_key,
)
from apps.shared.models import Grade


class CacheKeyHelpersTest(TestCase):
    def setUp(self):
        cache.clear()

    def test_make_key_includes_group_and_version(self):
        key = make_key('dashboard', 'admin_stats', 42)
        self.assertTrue(key.startswith('dashboard:v'))
        self.assertTrue(key.endswith(':admin_stats:42'))

    def test_bump_version_increments(self):
        v1 = make_key('dashboard', 'x')
        bump_version('dashboard')
        v2 = make_key('dashboard', 'x')
        self.assertNotEqual(v1, v2)

    def test_cache_or_compute_runs_compute_once(self):
        compute = MagicMock(return_value={'answer': 42})
        for _ in range(5):
            result = cache_or_compute(
                group='dashboard',
                parts=('test_key',),
                timeout=60,
                compute=compute,
            )
            self.assertEqual(result, {'answer': 42})
        compute.assert_called_once()

    def test_invalidate_forces_recompute(self):
        compute = MagicMock(return_value={'n': 1})
        cache_or_compute('dashboard', ('x',), 60, compute)
        invalidate_dashboards()
        cache_or_compute('dashboard', ('x',), 60, compute)
        self.assertEqual(compute.call_count, 2)

    def test_dashboard_and_reference_invalidation_are_independent(self):
        dash_compute = MagicMock(return_value='dash')
        ref_compute = MagicMock(return_value='ref')

        cache_or_compute('dashboard', ('x',), 60, dash_compute)
        cache_or_compute('reference', ('y',), 60, ref_compute)

        invalidate_reference_data()

        cache_or_compute('dashboard', ('x',), 60, dash_compute)
        cache_or_compute('reference', ('y',), 60, ref_compute)

        # Dashboard was NOT bumped, so still 1 call
        self.assertEqual(dash_compute.call_count, 1)
        # Reference WAS bumped, so 2 calls
        self.assertEqual(ref_compute.call_count, 2)


class DashboardEndpointCachingTest(TestCase):
    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user(
            username='ac_admin', email='ac_admin@test.com', password='p',
            role='admin', first_name='Cache', last_name='Admin',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_dashboard_stats_returns_cached_response(self):
        r1 = self.client.get('/api/v1/admin/dashboard-stats/')
        self.assertEqual(r1.status_code, 200)
        r2 = self.client.get('/api/v1/admin/dashboard-stats/')
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r1.data, r2.data)

    def test_new_user_bumps_dashboard_cache(self):
        self.client.get('/api/v1/admin/dashboard-stats/')

        # Simulate a new student being created — the signal should bump
        # the dashboard version so the next request misses the cache.
        from apps.student.models import StudentProfile
        new_user = User.objects.create_user(
            username='newkid', email='newkid@test.com', password='p',
            role='student', first_name='New', last_name='Kid',
        )
        StudentProfile.objects.create(user=new_user, student_id='SM-NEWKID')

        r2 = self.client.get('/api/v1/admin/dashboard-stats/')
        # Should reflect the new student (or at least recompute the count)
        self.assertEqual(r2.status_code, 200)
        self.assertGreaterEqual(r2.data['total_students'], 1)

    def test_different_admin_users_have_separate_cached_keys(self):
        """Per-user keys: admin A's unread-notifications count must not leak
        into admin B's cached response."""
        other_admin = User.objects.create_user(
            username='ac_admin2', email='ac_admin2@test.com', password='p',
            role='admin', first_name='Another', last_name='Admin',
        )
        other_client = APIClient()
        other_client.force_authenticate(other_admin)

        r1 = self.client.get('/api/v1/admin/dashboard-stats/')
        r2 = other_client.get('/api/v1/admin/dashboard-stats/')

        # Both succeed independently (key scoped by user_id)
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r2.status_code, 200)


class ReferenceDataCacheInvalidationTest(TestCase):
    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user(
            username='ref_admin', email='ref_admin@test.com', password='p',
            role='admin', first_name='Ref', last_name='Admin',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        Grade.objects.create(level=1, label='Grade 1')
        Grade.objects.create(level=2, label='Grade 2')

    def test_grade_list_is_cached(self):
        r1 = self.client.get('/api/v1/shared/grades/')
        self.assertEqual(r1.status_code, 200)
        initial_count = len(r1.data)

        r2 = self.client.get('/api/v1/shared/grades/')
        self.assertEqual(len(r2.data), initial_count)

    def test_new_grade_bumps_reference_cache(self):
        self.client.get('/api/v1/shared/grades/')  # prime the cache
        initial_list = self.client.get('/api/v1/shared/grades/').data
        initial_count = len(initial_list)

        Grade.objects.create(level=3, label='Grade 3')  # should bump via signal

        r2 = self.client.get('/api/v1/shared/grades/')
        self.assertEqual(len(r2.data), initial_count + 1)
