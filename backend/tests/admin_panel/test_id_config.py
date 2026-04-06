from django.test import TestCase
from apps.admin_panel.models import IDConfiguration


class IDConfigurationModelTest(TestCase):
    def test_full_prefix_property(self):
        config = IDConfiguration(role='teacher', prefix='MAJ', year='1998')
        self.assertEqual(config.full_prefix, 'MAJ1998')

    def test_unique_role_constraint(self):
        IDConfiguration.objects.create(role='teacher', prefix='MAJ', year='1998')
        with self.assertRaises(Exception):
            IDConfiguration.objects.create(role='teacher', prefix='XYZ', year='2000')

    def test_create_all_roles(self):
        for role in ['principal', 'teacher', 'student']:
            IDConfiguration.objects.create(role=role, prefix='MAJ', year='1998')
        self.assertEqual(IDConfiguration.objects.count(), 3)
