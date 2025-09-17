# Generated manually for Brand and Category model updates

from django.db import migrations, models
from django.db.models.functions import Lower
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0002_brand_service_storesettings_websitecontent_and_more'),
    ]

    operations = [
        # Add created_at field to Brand
        migrations.AddField(
            model_name='brand',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
        ),
        
        # Add created_at field to Category
        migrations.AddField(
            model_name='category',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
        ),
        
        # Update Brand name field max_length
        migrations.AlterField(
            model_name='brand',
            name='name',
            field=models.CharField(max_length=120, unique=True),
        ),
        
        # Add ordering to Brand
        migrations.AlterModelOptions(
            name='brand',
            options={'ordering': ['name']},
        ),
        
        # Add ordering to Category
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['name']},
        ),
        
        # Add unique constraint for Category (case-insensitive name per parent)
        migrations.AddConstraint(
            model_name='category',
            constraint=models.UniqueConstraint(
                Lower('name'), 'parent',
                name='uniq_category_name_per_parent_ci',
            ),
        ),
    ]