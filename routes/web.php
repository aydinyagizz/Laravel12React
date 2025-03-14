<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Product\ProductCategoryController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\UserController\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('dashboard', function () {
//        return Inertia::render('dashboard');
//    })->name('dashboard');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::group(['prefix' => 'user'], function () {
        Route::get('/', [UserController::class, 'index'])->name('user.index');
        Route::get('getAll', [UserController::class,'getAll'])->name('user.getAll');
        Route::post('create', [UserController::class, 'create'])->name('user.create');
        Route::get('edit/{id}', [UserController::class, 'edit'])->name('user.edit');
        Route::put('updateUser/{id}', [UserController::class, 'update'])->name('user.update');
        Route::delete('delete/{id}', [UserController::class, 'delete'])->name('user.delete');
    });

    Route::group(['prefix' => 'product'], function () {
        Route::get('/', [ProductController::class, 'index'])->name('product.index');
        Route::get('getAll', [ProductController::class,'getAll'])->name('product.getAll');
        Route::post('create', [ProductController::class, 'create'])->name('product.create');
        Route::get('getById/{id}', [ProductController::class, 'getById'])->name('product.getById');
        Route::put('updateProduct/{id}', [ProductController::class, 'update'])->name('product.update');
        Route::delete('delete/{id}', [ProductController::class, 'delete'])->name('product.delete');
        Route::post('bulkDelete', [ProductController::class, 'bulkDelete'])->name('product.bulkDelete');
    });

    Route::group(['prefix' => 'productCategory'], function () {
        Route::get('/', [ProductCategoryController::class, 'index'])->name('product.category.index');
        Route::get('getAll', [ProductCategoryController::class,'getAll'])->name('product.category.getAll');
        Route::post('create', [ProductCategoryController::class, 'create'])->name('product.category.create');
        Route::get('getById/{id}', [ProductCategoryController::class, 'getById'])->name('product.category.getById');
        Route::put('updateCategory/{id}', [ProductCategoryController::class, 'update'])->name('product.category.update');
        Route::delete('delete/{id}', [ProductCategoryController::class, 'delete'])->name('product.category.delete');
        Route::post('bulkDelete', [ProductCategoryController::class, 'bulkDelete'])->name('product.category.bulkDelete');
    });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
