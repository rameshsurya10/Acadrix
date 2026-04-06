from unittest.mock import patch
from django.test import TestCase
from apps.accounts.emails import send_welcome_email


class SendWelcomeEmailTest(TestCase):
    @patch('apps.accounts.emails.send_mail')
    def test_sends_teacher_welcome(self, mock_send):
        send_welcome_email(email='teacher@test.com', first_name='John', role='teacher', generated_id='MAJ1998-14')
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[1]
        self.assertIn('MAJ1998-14', call_kwargs['message'])
        self.assertIn('John', call_kwargs['message'])
        self.assertEqual(call_kwargs['recipient_list'], ['teacher@test.com'])

    @patch('apps.accounts.emails.send_mail')
    def test_sends_student_welcome(self, mock_send):
        send_welcome_email(email='student@test.com', first_name='Jane', role='student', generated_id='MAJ1998-42')
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[1]
        self.assertIn('MAJ1998-42', call_kwargs['message'])
        self.assertIn('student', call_kwargs['message'])
