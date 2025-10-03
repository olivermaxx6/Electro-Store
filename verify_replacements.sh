#!/bin/bash

# =============================================================================
# ✅ VERIFY FILE REPLACEMENTS
# =============================================================================

echo "✅ VERIFYING FILE REPLACEMENTS"
echo "==============================="
echo ""
echo "📅 Date: $(date)"
echo ""

# Navigate to admin pages directory
cd /opt/sppix-store/Frontend/src/admin/pages/admin

echo "📊 FILE STATUS AFTER REPLACEMENT:"
echo "================================="
echo ""

# Check ContentPage.jsx
content_lines=$(wc -l < ContentPage.jsx)
content_banner=$(grep -c "banner\|deal" ContentPage.jsx 2>/dev/null || echo "0")
content_management=$(grep -c "Content Management" ContentPage.jsx 2>/dev/null || echo "0")

echo "1. 📝 ContentPage.jsx:"
echo "   Lines: $content_lines (expected: ~1016)"
echo "   Banner/Deal features: $content_banner occurrences"
echo "   Content Management: $content_management occurrences"
if [ "$content_lines" -gt 800 ] && [ "$content_banner" -gt 5 ]; then
    echo "   Status: ✅ COMPLETE"
else
    echo "   Status: ❌ INCOMPLETE"
fi
echo ""

# Check ServicesPage.jsx
services_lines=$(wc -l < ServicesPage.jsx)
services_create=$(grep -c "Create Service" ServicesPage.jsx 2>/dev/null || echo "0")
services_management=$(grep -c "Service Management" ServicesPage.jsx 2>/dev/null || echo "0")

echo "2. 🔧 ServicesPage.jsx:"
echo "   Lines: $services_lines (expected: ~1991)"
echo "   Create Service: $services_create occurrences"
echo "   Service Management: $services_management occurrences"
if [ "$services_lines" -gt 1500 ] && [ "$services_create" -gt 3 ]; then
    echo "   Status: ✅ COMPLETE"
else
    echo "   Status: ❌ INCOMPLETE"
fi
echo ""

# Check UsersPage.jsx
users_lines=$(wc -l < UsersPage.jsx)
users_management=$(grep -c "User Management" UsersPage.jsx 2>/dev/null || echo "0")
users_crud=$(grep -c "Create User\|Edit User\|Delete User" UsersPage.jsx 2>/dev/null || echo "0")

echo "3. 👥 UsersPage.jsx:"
echo "   Lines: $users_lines (expected: ~489)"
echo "   User Management: $users_management occurrences"
echo "   User CRUD: $users_crud occurrences"
if [ "$users_lines" -gt 400 ] && [ "$users_management" -gt 0 ]; then
    echo "   Status: ✅ COMPLETE"
else
    echo "   Status: ❌ INCOMPLETE"
fi
echo ""

# Overall status
total_expected=3496
total_actual=$((content_lines + services_lines + users_lines))
completion_percentage=$(( (total_actual * 100) / total_expected ))

echo "📈 OVERALL STATUS:"
echo "=================="
echo "Total lines: $total_actual / $total_expected"
echo "Completion: $completion_percentage%"
echo ""

if [ "$completion_percentage" -gt 80 ]; then
    echo "🎉 SUCCESS! Files are properly updated."
    echo "✅ Ready to rebuild and deploy!"
    echo ""
    echo "🚀 Next step: ./rebuild_and_deploy.sh"
else
    echo "⚠️  Files still need updates."
    echo "❌ Please complete the file replacements first."
    echo ""
    echo "🔄 Run: ./replace_admin_files.sh"
fi
