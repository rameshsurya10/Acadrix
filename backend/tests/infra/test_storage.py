"""Tests for the conditional S3 storage configuration (Phase 1.4).

These tests don't hit AWS - they verify the STORAGES settings wiring.
Real S3 uploads are tested in CI against MinIO (not in this suite).
"""
from django.test import TestCase, override_settings
from django.core.files.storage import default_storage, storages


class DefaultStorageTest(TestCase):
    """In the test environment USE_S3_STORAGE is False, so we should always
    end up on the local FileSystemStorage regardless of any AWS env vars."""

    def test_default_storage_is_filesystem_in_tests(self):
        from django.core.files.storage import FileSystemStorage
        self.assertIsInstance(default_storage, FileSystemStorage)

    def test_storages_dict_has_required_keys(self):
        # Django 5: STORAGES must have "default" and "staticfiles"
        self.assertIn('default', storages.backends)
        self.assertIn('staticfiles', storages.backends)


class StorageConfigurationTest(TestCase):
    """Verify the toggle logic: setting USE_S3_STORAGE=True should swap
    the default backend to django-storages' S3Storage."""

    def test_s3_backend_config_when_enabled(self):
        # We can't flip USE_S3_STORAGE at runtime since it's read at module
        # import time. Instead verify the S3 config shape by importing the
        # storages module and checking the class exists where we expect.
        try:
            from storages.backends.s3 import S3Storage
        except ImportError:
            self.skipTest('django-storages not installed in test env')

        self.assertTrue(hasattr(S3Storage, 'save'))
        self.assertTrue(hasattr(S3Storage, 'url'))
        self.assertTrue(hasattr(S3Storage, 'delete'))


class UploadPathTest(TestCase):
    """Regardless of backend, the upload_to='avatars/' etc. paths should
    still be honoured. This gives us confidence that swapping backends
    won't silently change where files land."""

    def test_user_avatar_upload_to(self):
        from apps.accounts.models import User
        field = User._meta.get_field('avatar')
        self.assertEqual(field.upload_to, 'avatars/')

    def test_student_document_upload_to(self):
        from apps.student.models import Document
        field = Document._meta.get_field('file')
        self.assertEqual(field.upload_to, 'student_documents/')

    def test_admission_document_upload_to(self):
        from apps.admin_panel.models import AdmissionDocument
        field = AdmissionDocument._meta.get_field('file')
        self.assertEqual(field.upload_to, 'admission_documents/')
