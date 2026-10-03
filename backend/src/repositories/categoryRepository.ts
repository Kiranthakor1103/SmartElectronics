import { Category, ICategory } from "../models/Category";
import { BaseRepository } from "./baseRepository";

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }

  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } }).exec();
  }

  async getAllCategories(): Promise<ICategory[]> {
    return Category.find().sort({ name: 1 }).exec();
  }

  async updateCategoryByName(name: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findOneAndUpdate(
      { name: { $regex: `^${name.trim()}$`, $options: "i" } },
      { $set: data },
      { new: true }
    ).exec();
  }

  async deleteCategoryByName(name: string): Promise<boolean> {
    const result = await Category.deleteOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } }).exec();
    return result.deletedCount > 0;
  }
}

export const categoryRepository = new CategoryRepository();
