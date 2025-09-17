# Generated manually to allow null brand in Product model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adminpanel', '0006_product_discount_rate'),
    ]

    operations = [
        # Change brand field to allow null values and use SET_NULL
        migrations.AlterField(
            model_name='product',
            name='brand',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=models.SET_NULL, 
                related_name='products', 
                to='adminpanel.brand'
            ),
        ),
    ]
