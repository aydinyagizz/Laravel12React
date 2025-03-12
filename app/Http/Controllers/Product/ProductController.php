<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use function Termwind\render;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render("products/index");
    }

    public function getAll()
    {
        $products = Product::with('category')->get();
        return response()->json([
            'products' => $products
        ]);
    }

    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required'
        ]);
        $product = new Product();
        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->category_id = $request->category_id;
        $product->save();

        return response()->json([
            'products' => $product
        ]);
    }

    public function getById(int $id)
    {
        $product = Product::with('category')->find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Ürün bulunamadı'
            ], 404);
        }
        return response()->json([
            'product' => $product
        ], 200);
    }

    public function update(int $id, Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required'
        ]);
        $product = Product::findOrFail($id);
        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->category_id = $request->category_id;
        $product->save();

        return response()->json([
            'product' => $product,
            'message' => 'Ürün başarıyla güncellendi'
        ],200);
    }

    public function delete(int $id)
    {
        $product = Product::findOrFail($id);
        if (!$product) {
            return response()->json([
                'message' => 'Ürün bulunamadı'
            ], 404);
        }
        $product->delete();

        return response()->json([
            'message' => 'Ürün başarıyla silindi'
        ], 200);
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            // Delete the products with the given IDs
            Product::whereIn('id', $ids)->delete();

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
