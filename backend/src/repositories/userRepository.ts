import { User, IUser } from "../models/User";
import { BaseRepository } from "./baseRepository";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+password").exec();
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId }).exec();
  }

  async updateRole(userId: string, role: "user" | "seller" | "admin"): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { role }, { new: true }).exec();
  }

  async findAllUsers(filter = {}, skip = 0, limit = 50): Promise<IUser[]> {
    return User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }
}

export const userRepository = new UserRepository();
