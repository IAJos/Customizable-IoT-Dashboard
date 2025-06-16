from django import forms
from .models import Sensor


class SensorForm(forms.ModelForm):
    class Meta:
        model = Sensor
        fields = ['title', 'topic', 'description', 'icon', 'iconColor']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field_name, field in self.fields.items():
            field.label_suffix = ''
            field.widget.attrs['aria-label'] = self.fields[field_name].label
