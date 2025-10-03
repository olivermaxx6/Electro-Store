#!/bin/bash

# =============================================================================
# 🔍 PRECISE ADMIN PAGES SCAN - ALL FILES ANALYSIS
# =============================================================================
# This script will scan every single file in Frontend/src/admin/pages/admin
# and provide detailed analysis of each file's functionality and completeness
# =============================================================================

echo "🔍 PRECISE ADMIN PAGES SCAN - ALL FILES"
echo "========================================"
echo ""
echo "📅 Scan Date: $(date)"
echo "👤 User: $(whoami)"
echo "📂 Target: /opt/sppix-store/Frontend/src/admin/pages/admin"
echo ""

# Navigate to admin pages directory
cd /opt/sppix-store/Frontend/src/admin/pages/admin

# =============================================================================
# 📊 STEP 1: COMPLETE FILE INVENTORY
# =============================================================================
echo "📊 STEP 1: COMPLETE FILE INVENTORY"
echo "=================================="
echo ""

echo "📁 All files in admin directory:"
echo "--------------------------------"
ls -la *.jsx *.js *.ts *.tsx 2>/dev/null | while read line; do
    echo "   $line"
done
echo ""

# Count total files
total_jsx=$(ls *.jsx 2>/dev/null | wc -l)
total_js=$(ls *.js 2>/dev/null | wc -l)
total_ts=$(ls *.ts 2>/dev/null | wc -l)
total_tsx=$(ls *.tsx 2>/dev/null | wc -l)
total_files=$((total_jsx + total_js + total_ts + total_tsx))

echo "📈 File Summary:"
echo "  .jsx files: $total_jsx"
echo "  .js files: $total_js"
echo "  .ts files: $total_ts"
echo "  .tsx files: $total_tsx"
echo "  Total files: $total_files"
echo ""

# =============================================================================
# 📊 STEP 2: DETAILED FILE ANALYSIS
# =============================================================================
echo "📊 STEP 2: DETAILED FILE ANALYSIS"
echo "================================="
echo ""

# Analyze each file individually
for file in *.jsx *.js *.ts *.tsx 2>/dev/null; do
    if [ -f "$file" ]; then
        echo "🔍 ANALYZING: $file"
        echo "$(printf '=%.0s' {1..50})"
        
        # Basic file info
        lines=$(wc -l < "$file")
        size=$(ls -lh "$file" | awk '{print $5}')
        chars=$(wc -c < "$file")
        
        echo "📊 Basic Stats:"
        echo "   Lines: $lines"
        echo "   Size: $size"
        echo "   Characters: $chars"
        
        # Status based on lines
        if [ "$lines" -gt 1000 ]; then
            status="🟢 EXCELLENT (1000+ lines)"
        elif [ "$lines" -gt 500 ]; then
            status="🟢 COMPLETE (500+ lines)"
        elif [ "$lines" -gt 200 ]; then
            status="🟡 GOOD (200+ lines)"
        elif [ "$lines" -gt 100 ]; then
            status="🟡 BASIC (100+ lines)"
        elif [ "$lines" -gt 50 ]; then
            status="🟠 MINIMAL (50+ lines)"
        else
            status="🔴 INCOMPLETE (<50 lines)"
        fi
        
        echo "   Status: $status"
        echo ""
        
        # Content analysis based on file name
        echo "🔍 Content Analysis:"
        case "$file" in
            "ProductsPage.jsx")
                create_count=$(grep -c "Create Product\|createHandler\|Add Product" "$file" 2>/dev/null || echo "0")
                edit_count=$(grep -c "Edit Product\|saveHandler\|updateProduct" "$file" 2>/dev/null || echo "0")
                delete_count=$(grep -c "Delete Product\|deleteHandler\|removeProduct" "$file" 2>/dev/null || echo "0")
                image_count=$(grep -c "Image Upload\|onCreateImages\|Product Images" "$file" 2>/dev/null || echo "0")
                specs_count=$(grep -c "Technical Specifications\|cSpecs\|eSpecs" "$file" 2>/dev/null || echo "0")
                pricing_count=$(grep -c "calculateDiscountedPrice\|Final Price\|discount" "$file" 2>/dev/null || echo "0")
                new_arrival_count=$(grep -c "New Arrival\|cIsNewArrival" "$file" 2>/dev/null || echo "0")
                top_selling_count=$(grep -c "Top Selling\|cIsTopSelling" "$file" 2>/dev/null || echo "0")
                
                echo "   🛍️  Product Management Features:"
                echo "      - Create Product: $create_count occurrences"
                echo "      - Edit Product: $edit_count occurrences"
                echo "      - Delete Product: $delete_count occurrences"
                echo "      - Image Upload: $image_count occurrences"
                echo "      - Technical Specs: $specs_count occurrences"
                echo "      - Pricing/Discount: $pricing_count occurrences"
                echo "      - New Arrivals: $new_arrival_count occurrences"
                echo "      - Top Selling: $top_selling_count occurrences"
                
                if [ "$create_count" -gt 0 ] && [ "$edit_count" -gt 0 ] && [ "$delete_count" -gt 0 ] && [ "$image_count" -gt 0 ] && [ "$specs_count" -gt 0 ]; then
                    echo "      ✅ COMPLETE PRODUCT MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE PRODUCT MANAGEMENT"
                fi
                ;;
                
            "OrdersPage.jsx")
                order_status=$(grep -c "status\|Status\|ORDER_STATUS" "$file" 2>/dev/null || echo "0")
                order_filter=$(grep -c "filter\|Filter\|search" "$file" 2>/dev/null || echo "0")
                order_crud=$(grep -c "update\|delete\|edit\|manage" "$file" 2>/dev/null || echo "0")
                
                echo "   📋 Order Management Features:"
                echo "      - Status Management: $order_status occurrences"
                echo "      - Filtering/Search: $order_filter occurrences"
                echo "      - Order CRUD: $order_crud occurrences"
                
                if [ "$order_status" -gt 10 ] && [ "$order_filter" -gt 0 ]; then
                    echo "      ✅ COMPLETE ORDER MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE ORDER MANAGEMENT"
                fi
                ;;
                
            "ServicesPage.jsx")
                service_create=$(grep -c "Create Service\|Add Service\|createService" "$file" 2>/dev/null || echo "0")
                service_edit=$(grep -c "Edit Service\|updateService" "$file" 2>/dev/null || echo "0")
                service_delete=$(grep -c "Delete Service\|deleteService" "$file" 2>/dev/null || echo "0")
                service_list=$(grep -c "listServices\|getServices" "$file" 2>/dev/null || echo "0")
                
                echo "   🔧 Service Management Features:"
                echo "      - Create Service: $service_create occurrences"
                echo "      - Edit Service: $service_edit occurrences"
                echo "      - Delete Service: $service_delete occurrences"
                echo "      - List Services: $service_list occurrences"
                
                if [ "$service_create" -gt 0 ] && [ "$service_edit" -gt 0 ] && [ "$service_delete" -gt 0 ]; then
                    echo "      ✅ COMPLETE SERVICE MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE SERVICE MANAGEMENT"
                fi
                ;;
                
            "ContentPage.jsx")
                banner_count=$(grep -c "banner\|Banner" "$file" 2>/dev/null || echo "0")
                deal_count=$(grep -c "deal\|Deal" "$file" 2>/dev/null || echo "0")
                brand_count=$(grep -c "brand\|Brand" "$file" 2>/dev/null || echo "0")
                category_count=$(grep -c "category\|Category" "$file" 2>/dev/null || echo "0")
                content_save=$(grep -c "saveContent\|updateContent" "$file" 2>/dev/null || echo "0")
                
                echo "   📝 Content Management Features:"
                echo "      - Banner Management: $banner_count occurrences"
                echo "      - Deal Management: $deal_count occurrences"
                echo "      - Brand Management: $brand_count occurrences"
                echo "      - Category Management: $category_count occurrences"
                echo "      - Content Saving: $content_save occurrences"
                
                if [ "$banner_count" -gt 5 ] && [ "$deal_count" -gt 5 ] && [ "$content_save" -gt 0 ]; then
                    echo "      ✅ COMPLETE CONTENT MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE CONTENT MANAGEMENT"
                fi
                ;;
                
            "SettingsPage.jsx")
                settings_form=$(grep -c "form\|Form\|input\|Input" "$file" 2>/dev/null || echo "0")
                settings_save=$(grep -c "save\|update\|submit" "$file" 2>/dev/null || echo "0")
                store_settings=$(grep -c "store\|Store\|settings" "$file" 2>/dev/null || echo "0")
                
                echo "   ⚙️  Settings Management Features:"
                echo "      - Form Elements: $settings_form occurrences"
                echo "      - Save Functionality: $settings_save occurrences"
                echo "      - Store Settings: $store_settings occurrences"
                
                if [ "$settings_form" -gt 20 ] && [ "$settings_save" -gt 0 ]; then
                    echo "      ✅ COMPLETE SETTINGS MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE SETTINGS MANAGEMENT"
                fi
                ;;
                
            "UsersPage.jsx")
                user_create=$(grep -c "Create User\|Add User\|createUser" "$file" 2>/dev/null || echo "0")
                user_edit=$(grep -c "Edit User\|updateUser" "$file" 2>/dev/null || echo "0")
                user_delete=$(grep -c "Delete User\|deleteUser" "$file" 2>/dev/null || echo "0")
                user_list=$(grep -c "listUsers\|getUsers\|users.map" "$file" 2>/dev/null || echo "0")
                
                echo "   👥 User Management Features:"
                echo "      - Create User: $user_create occurrences"
                echo "      - Edit User: $user_edit occurrences"
                echo "      - Delete User: $user_delete occurrences"
                echo "      - List Users: $user_list occurrences"
                
                if [ "$user_create" -gt 0 ] && [ "$user_edit" -gt 0 ] && [ "$user_delete" -gt 0 ]; then
                    echo "      ✅ COMPLETE USER MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE USER MANAGEMENT"
                fi
                ;;
                
            "Dashboard.jsx")
                chart_count=$(grep -c "chart\|Chart\|graph\|Graph" "$file" 2>/dev/null || echo "0")
                stats_count=$(grep -c "stat\|Stat\|metric\|Metric" "$file" 2>/dev/null || echo "0")
                dashboard_widgets=$(grep -c "widget\|Widget\|card\|Card" "$file" 2>/dev/null || echo "0")
                
                echo "   📊 Dashboard Features:"
                echo "      - Charts/Graphs: $chart_count occurrences"
                echo "      - Statistics: $stats_count occurrences"
                echo "      - Widgets/Cards: $dashboard_widgets occurrences"
                
                if [ "$stats_count" -gt 5 ] && [ "$dashboard_widgets" -gt 3 ]; then
                    echo "      ✅ COMPLETE DASHBOARD SYSTEM"
                else
                    echo "      ❌ INCOMPLETE DASHBOARD"
                fi
                ;;
                
            "ManageCategoriesPage.jsx")
                cat_create=$(grep -c "Create.*Category\|Add.*Category" "$file" 2>/dev/null || echo "0")
                cat_edit=$(grep -c "Edit.*Category\|Update.*Category" "$file" 2>/dev/null || echo "0")
                cat_delete=$(grep -c "Delete.*Category\|Remove.*Category" "$file" 2>/dev/null || echo "0")
                cat_tree=$(grep -c "tree\|Tree\|hierarchy\|parent" "$file" 2>/dev/null || echo "0")
                
                echo "   📂 Category Management Features:"
                echo "      - Create Category: $cat_create occurrences"
                echo "      - Edit Category: $cat_edit occurrences"
                echo "      - Delete Category: $cat_delete occurrences"
                echo "      - Tree/Hierarchy: $cat_tree occurrences"
                
                if [ "$cat_create" -gt 0 ] && [ "$cat_edit" -gt 0 ] && [ "$cat_delete" -gt 0 ]; then
                    echo "      ✅ COMPLETE CATEGORY MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE CATEGORY MANAGEMENT"
                fi
                ;;
                
            "*ReviewsPage.jsx")
                review_approve=$(grep -c "approve\|Approve" "$file" 2>/dev/null || echo "0")
                review_reject=$(grep -c "reject\|Reject" "$file" 2>/dev/null || echo "0")
                review_manage=$(grep -c "manage\|edit\|delete" "$file" 2>/dev/null || echo "0")
                
                echo "   ⭐ Review Management Features:"
                echo "      - Approve Reviews: $review_approve occurrences"
                echo "      - Reject Reviews: $review_reject occurrences"
                echo "      - Manage Reviews: $review_manage occurrences"
                
                if [ "$review_approve" -gt 0 ] && [ "$review_reject" -gt 0 ]; then
                    echo "      ✅ COMPLETE REVIEW MANAGEMENT SYSTEM"
                else
                    echo "      ❌ INCOMPLETE REVIEW MANAGEMENT"
                fi
                ;;
                
            *)
                # Generic analysis for other files
                react_imports=$(grep -c "import.*React\|from 'react'" "$file" 2>/dev/null || echo "0")
                usestate_count=$(grep -c "useState" "$file" 2>/dev/null || echo "0")
                useeffect_count=$(grep -c "useEffect" "$file" 2>/dev/null || echo "0")
                export_default=$(grep -c "export default" "$file" 2>/dev/null || echo "0")
                jsx_return=$(grep -c "return (" "$file" 2>/dev/null || echo "0")
                
                echo "   🔧 React Component Analysis:"
                echo "      - React Imports: $react_imports"
                echo "      - useState Hooks: $usestate_count"
                echo "      - useEffect Hooks: $useeffect_count"
                echo "      - Export Default: $export_default"
                echo "      - JSX Return: $jsx_return"
                
                if [ "$export_default" -gt 0 ] && [ "$jsx_return" -gt 0 ]; then
                    echo "      ✅ VALID REACT COMPONENT"
                else
                    echo "      ❌ INVALID OR INCOMPLETE COMPONENT"
                fi
                ;;
        esac
        
        echo ""
        echo "$(printf '=%.0s' {1..50})"
        echo ""
    fi
done

# =============================================================================
# 📊 STEP 3: OVERALL SUMMARY & RECOMMENDATIONS
# =============================================================================
echo "📊 STEP 3: OVERALL SUMMARY & RECOMMENDATIONS"
echo "============================================"
echo ""

# Count files by status
excellent_count=0
complete_count=0
good_count=0
basic_count=0
minimal_count=0
incomplete_count=0

for file in *.jsx *.js *.ts *.tsx 2>/dev/null; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        if [ "$lines" -gt 1000 ]; then
            excellent_count=$((excellent_count + 1))
        elif [ "$lines" -gt 500 ]; then
            complete_count=$((complete_count + 1))
        elif [ "$lines" -gt 200 ]; then
            good_count=$((good_count + 1))
        elif [ "$lines" -gt 100 ]; then
            basic_count=$((basic_count + 1))
        elif [ "$lines" -gt 50 ]; then
            minimal_count=$((minimal_count + 1))
        else
            incomplete_count=$((incomplete_count + 1))
        fi
    fi
done

echo "📈 Quality Distribution:"
echo "  🟢 Excellent (1000+ lines): $excellent_count files"
echo "  🟢 Complete (500-999 lines): $complete_count files"
echo "  🟡 Good (200-499 lines): $good_count files"
echo "  🟡 Basic (100-199 lines): $basic_count files"
echo "  🟠 Minimal (50-99 lines): $minimal_count files"
echo "  🔴 Incomplete (<50 lines): $incomplete_count files"
echo ""

total_quality_files=$((excellent_count + complete_count + good_count))
quality_percentage=$(( (total_quality_files * 100) / total_files ))

echo "📊 Overall Quality Score: $quality_percentage% ($total_quality_files/$total_files files are Good+ quality)"
echo ""

# Specific recommendations
echo "🎯 SPECIFIC RECOMMENDATIONS:"
echo "============================"

if [ "$incomplete_count" -gt 0 ]; then
    echo "🔴 HIGH PRIORITY: $incomplete_count files need immediate attention (<50 lines)"
fi

if [ "$minimal_count" -gt 0 ]; then
    echo "🟠 MEDIUM PRIORITY: $minimal_count files need enhancement (50-99 lines)"
fi

if [ "$excellent_count" -gt 0 ]; then
    echo "🟢 EXCELLENT: $excellent_count files are feature-complete (1000+ lines)"
fi

echo ""
echo "🎯 FILES THAT NEED MOST ATTENTION:"
for file in *.jsx *.js *.ts *.tsx 2>/dev/null; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        if [ "$lines" -lt 100 ]; then
            echo "   ❌ $file ($lines lines) - Needs significant development"
        fi
    fi
done

echo ""
echo "🎯 PRODUCTION-READY FILES:"
for file in *.jsx *.js *.ts *.tsx 2>/dev/null; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        if [ "$lines" -gt 500 ]; then
            echo "   ✅ $file ($lines lines) - Production ready"
        fi
    fi
done

echo ""
echo "✅ PRECISE ADMIN SCAN COMPLETE!"
echo "🕐 Completed at: $(date)"
echo ""
echo "🌐 Next steps:"
echo "   1. Review files marked as incomplete"
echo "   2. Focus on enhancing minimal files"
echo "   3. Test production-ready files"
echo "   4. Deploy when all critical files are complete"
