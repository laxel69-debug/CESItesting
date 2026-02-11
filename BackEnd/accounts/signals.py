from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ParentProfile, TeacherProfile

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'PARENT':
            ParentProfile.objects.create(user=instance)
        elif instance.role == 'TEACHER':
            TeacherProfile.objects.create(user=instance)
