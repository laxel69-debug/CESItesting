from django.db import models
from accounts.models import User


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('TUITION', 'Tuition Fee'),
        ('MISC', 'Miscellaneous'),
        ('REGISTRATION', 'Registration Fee'),
        ('BOOKS', 'Books & Materials'),
        ('UNIFORM', 'Uniform'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('OVERDUE', 'Overdue'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('GCASH', 'GCash'),
        ('PAYMAYA', 'PayMaya'),
        ('CHECK', 'Check'),
        ('OTHER', 'Other'),
    ]

    # FK to the parent/student user account
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='transactions',
        limit_choices_to={'role': 'PARENT_STUDENT'},
    )

    student_name = models.CharField(max_length=150)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, default='CASH'
    )
    reference_number = models.CharField(max_length=50, blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')

    class Meta:
        ordering = ['-date_created']

    def __str__(self):
        return f"{self.student_name} - {self.transaction_type} ({self.id})"



