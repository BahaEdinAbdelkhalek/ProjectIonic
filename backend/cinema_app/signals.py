from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Utilisateur, Favori


@receiver(post_save, sender=User)
def creer_profil_utilisateur(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'utilisateur'):
        Utilisateur.objects.create(
            user=instance,
            nom=instance.last_name,
            prenom=instance.first_name,
            age=0,
        )


@receiver(post_save, sender=Favori)
def log_ajout_favori(sender, instance, created, **kwargs):
    if created:
        print('Signal : %s a ajoute %s en favori' % (instance.utilisateur, instance.movie))


@receiver(post_delete, sender=Favori)
def log_retrait_favori(sender, instance, **kwargs):
    print('Signal : %s a retire %s de ses favoris' % (instance.utilisateur, instance.movie))
