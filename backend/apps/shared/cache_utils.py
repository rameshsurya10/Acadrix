"""Cache helpers for Phase 1.6.

Thin wrapper around django.core.cache that:
  - Namespaces keys consistently
  - Uses a "version key" pattern for group invalidation (avoids KEYS scans)
  - Provides tiny helpers so views stay readable

Pattern:
    Instead of tracking individual cache keys and deleting them on change,
    we store a small integer "version" per group (dashboard, reference, etc).
    Every cache lookup includes the version in its key. To "invalidate" the
    group, we just bump the version — stale entries become unreachable and
    are reaped by Redis TTL over time.

Groups:
    dashboard   - admin/principal/super_admin/finance overview
    reference   - grades, subjects, faculty directory
"""
from __future__ import annotations

from typing import Any, Callable

from django.core.cache import cache


# ── Version keys for group invalidation ────────────────────────────────────

_VERSION_KEYS = {
    'dashboard': 'cache:ver:dashboard',
    'reference': 'cache:ver:reference',
}


def _get_version(group: str) -> int:
    """Return the current version number for a cache group. Starts at 1."""
    key = _VERSION_KEYS[group]
    version = cache.get(key)
    if version is None:
        cache.set(key, 1, timeout=None)  # no expiry on version keys
        return 1
    return version


def bump_version(group: str) -> int:
    """Atomically increment the version of a cache group.

    This is the invalidation primitive. After a bump, all cached values
    with the previous version become inaccessible (next lookup computes fresh).
    """
    key = _VERSION_KEYS[group]
    try:
        return cache.incr(key)
    except ValueError:
        # Key doesn't exist yet — initialise to 2 (skip 1 to force miss)
        cache.set(key, 2, timeout=None)
        return 2


def make_key(group: str, *parts: Any) -> str:
    """Build a versioned cache key.

    Examples:
        make_key('dashboard', 'admin_stats', user.id)
            -> 'dashboard:v3:admin_stats:42'
        make_key('reference', 'grades_list')
            -> 'reference:v1:grades_list'
    """
    version = _get_version(group)
    parts_str = ':'.join(str(p) for p in parts if p is not None)
    return f'{group}:v{version}:{parts_str}'


def cache_or_compute(
    group: str,
    parts: tuple[Any, ...],
    timeout: int,
    compute: Callable[[], Any],
) -> Any:
    """Read-through cache helper.

    Usage:
        data = cache_or_compute(
            group='dashboard',
            parts=('admin_stats', request.user.id),
            timeout=60,
            compute=lambda: _build_stats(request.user),
        )
    """
    key = make_key(group, *parts)
    return cache.get_or_set(key, compute, timeout=timeout)


# ── Convenience invalidators ───────────────────────────────────────────────

def invalidate_dashboards() -> None:
    """Bump the dashboard version. Call this when:
    - A user is created or deactivated
    - A payment is recorded
    - An admission changes state
    """
    bump_version('dashboard')


def invalidate_reference_data() -> None:
    """Bump the reference version. Call this when:
    - A Grade / Subject / AcademicYear is added or modified
    - A User's role/profile changes (faculty directory)
    """
    bump_version('reference')
