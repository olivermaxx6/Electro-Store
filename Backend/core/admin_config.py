from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.conf import settings

class CustomAdminSite(admin.AdminSite):
    """Custom admin site that redirects to React frontend"""
    
    def login(self, request, extra_context=None):
        """Redirect login to React frontend admin"""
        if request.user.is_authenticated:
            return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)
        return HttpResponseRedirect(settings.LOGIN_URL)
    
    def index(self, request, extra_context=None):
        """Redirect admin index to React frontend"""
        return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)
    
    def app_index(self, request, app_label, extra_context=None):
        """Redirect app index to React frontend"""
        return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)
    
    def get_urls(self):
        """Override URLs to redirect all admin routes"""
        urls = super().get_urls()
        # Add a catch-all redirect for any admin route
        custom_urls = [
            path('', self.index, name='index'),
            path('login/', self.login, name='login'),
            path('<path:path>/', self.index, name='catch_all'),
        ]
        return custom_urls + urls

# Create custom admin site instance
admin_site = CustomAdminSite(name='custom_admin')
