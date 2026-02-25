<?php

namespace App\Http\Controllers\Categories;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Jobs\Categories\CreateCategory;
use App\Jobs\Categories\DeleteCategory;
use App\Jobs\Categories\UpdateCategory;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('categories/index', [
            'categories' => $user->categories()->with('parent')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        CreateCategory::dispatch(
            user: $request->user(),
            data: $request->validated(),
        );

        return redirect()->back()->with('success', 'Category created.');
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        UpdateCategory::dispatch(
            user: $request->user(),
            category: $category,
            data: $request->validated(),
        );

        return redirect()->back()->with('success', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        DeleteCategory::dispatch(
            user: auth()->user(),
            category: $category,
        );

        return redirect()->back()->with('success', 'Category deleted.');
    }
}
