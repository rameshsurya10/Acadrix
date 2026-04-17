"""Shared pytest fixtures for Acadrix backend tests."""
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Unauthenticated DRF APIClient."""
    return APIClient()


@pytest.fixture
def admin_user(db, django_user_model):
    """A baseline admin user for tests that need authentication."""
    return django_user_model.objects.create_user(
        username='admin_test',
        email='admin_test@acadrix.local',
        password='TestPass123!',
        role='admin',
        first_name='Admin',
        last_name='Test',
    )


@pytest.fixture
def authed_admin_client(api_client, admin_user):
    """APIClient pre-authenticated as an admin user via force_authenticate."""
    api_client.force_authenticate(user=admin_user)
    return api_client
