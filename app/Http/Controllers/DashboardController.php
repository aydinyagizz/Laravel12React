<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
//    public function index()
//    {
//        $startDate = Carbon::now()->subMonth()->startOfDay(); // 1 ay önce
//        $endDate = Carbon::now()->endOfDay(); // Bugün
//
//        $usersByDate = User::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
//            ->whereBetween('created_at', [$startDate, $endDate])
//            ->groupBy('date')
//            ->orderBy('date', 'ASC')
//            ->get();
//
//        $productsByDate = Product::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
//            ->whereBetween('created_at', [$startDate, $endDate])
//            ->groupBy('date')
//            ->orderBy('date', 'ASC')
//            ->get();
//
//
//        $formattedData = [];
//        $formattedDataProduct = [];
//        $dateRange = [];
//        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
//            $dateRange[$date->toDateString()] = 0;
//        }
//
//        foreach ($usersByDate as $user) {
//            $dateRange[$user->date] = $user->count;
//        }
//
//        foreach ($productsByDate as $product) {
//            $dateRange[$product->date] = $product->count;
//        }
//
//        foreach ($dateRange as $date => $count) {
//            $formattedData[] = [
//                'date' => $date,
//                'count' => $count
//            ];
//        }
//
//        foreach ($dateRange as $date => $count) {
//            $formattedDataProduct[] = [
//                'date' => $date,
//                'count' => $count
//            ];
//        }
//
//        return Inertia::render('dashboard', [
////            'users' => User::all(),
//            'chartData' => $formattedData,
//            'chartDataProduct' => $formattedDataProduct
//        ]);
//    }

    public function index()
    {
        $startDate = Carbon::now()->subMonth()->startOfDay(); // 1 ay önce
        $endDate = Carbon::now()->endOfDay(); // Bugün

        $usersByDate = User::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date')
            ->map(function ($item) {
                return $item->count;
            })
            ->toArray();

        $productsByDate = Product::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date')
            ->map(function ($item) {
                return $item->count;
            })
            ->toArray();

        $combinedData = [];
        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            $dateString = $date->toDateString();
            $combinedData[] = [
                'date' => $dateString,
                'users' => $usersByDate[$dateString] ?? 0,
                'products' => $productsByDate[$dateString] ?? 0
            ];
        }

        return Inertia::render('dashboard', [
            'chartData' => $combinedData
        ]);
    }
}
