<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id'
    ];

    //category
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

}
