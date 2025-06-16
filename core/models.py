from django.db import models


class Sensor(models.Model):
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    icon = models.CharField(max_length=255)
    iconColor = models.CharField(max_length=255)
    description = models.CharField(blank=True, null=True, max_length=255)

    def __str__(self):
        return self.title
