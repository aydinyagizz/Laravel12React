<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render("productCategory/index");
    }

    public function getAll()
    {
        $categories = ProductCategory::all();
        return response()->json([
            'productCategory' => $categories
        ]);
    }

    public function getById(int $id)
    {
        $category = ProductCategory::find($id);
        if (!$category) {
            return response()->json([
                'message' => 'Ürün kategorisi bulunamadı'
            ], 404);
        }
        return response()->json([
            'category' => $category
        ], 200);
    }

    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $category = new ProductCategory();
        $category->name = $request->name;
        $category->save();

        return response()->json([
            'productCategory' => $category
        ]);
    }

    public function update(int $id, Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $category = ProductCategory::findOrFail($id);
        $category->name = $request->name;
        $category->save();

        return response()->json([
            'productCategory' => $category,
            'message' => 'Ürün kategorisi başarıyla güncellendi'
        ],200);
    }

    public function delete(int $id)
    {
        try {
            $category = ProductCategory::findOrFail($id);

            // Eğer silinecek kategori bir üründe kullanılmışsa silinmesin
            if ($category->products()->exists()) {
                return response()->json([
                    'message' => 'Bu kategori bir üründe kullanıldığı için silinemez'
                ], 400);
            }

            $category->delete();

            return response()->json([
                'message' => 'Ürün kategorisi başarıyla silindi'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Bir hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            $categories = ProductCategory::whereIn('id', $ids)->get();
            foreach ($categories as $category) {
                if ($category->products()->exists()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Kategori silinemez. Bu kategoriye ait ürünler var.'
                    ], 400);
                }
            }

            // Delete the products with the given IDs
            ProductCategory::whereIn('id', $ids)->delete();

            return response()->json([
                'success' => true,
                'message' => count($ids) . ' adet ürün başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ürünler silinemedi: ' . $e->getMessage()
            ], 500);
        }
    }
}
