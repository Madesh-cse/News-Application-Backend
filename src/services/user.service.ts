import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { type RegisterUserInput, type LoginUserInput ,type UpdateUserProfileInput, type ChangePasswordInput } from "../validators/user.validator.js";
import { toSafeUser } from "../utils/safeUser.util.js";
import { generateAcessToken } from "../utils/jwt.util.js";

class UserService{
    async registerUser(input: RegisterUserInput){
        const email = input.email.toLowerCase().trim();
        const exsistingUser = await UserModel.findOne({email});
        if(exsistingUser){
            throw new ApiError(409, "An account with this email already exists")
        }
        try{
            // create a new user
            const user = await UserModel.create({
                name: input.name,
                email,
                passwordHash: input.password
            });
            await user.save();
            return toSafeUser(user)
        }
        catch(err:any){
            if(err.code === 11000){
                throw new ApiError(409, "An account with this email already exists")
            }
            throw err;
        }
    }

    async loginUser(input: LoginUserInput ){
        const email = input.email.toLowerCase().trim();
        const user = await UserModel.findOne({email}).select("+passwordHash");
        if(!user){
            throw new ApiError(401, "Invalid email or password")
        }
        // check account status
        if(user.status !== "active"){
            throw new ApiError(403, "Your account is blocked");
        }
        // Compare submitted password with stored bcrypt hash
       const isPasswordValid = await bcrypt.compare(input.password,user.passwordHash);
        if(!isPasswordValid){
          throw new ApiError(401, "Invalid email or password");
        }
       const safeUser =  toSafeUser(user);
       const accessToken = generateAcessToken(user._id.toString(), user.role, user.tokenVersion);
        return {
            user: safeUser,
            accessToken
        }
    }

    // get the detail of user by an id
    async getCurrentUser(userId: string){
        const user = await UserModel.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found")
        }
        if(user.status !== "active"){
            throw new ApiError(403,"Your account is blocked")
        }
        return toSafeUser(user);
    }

    async updateUserProfile(userId: string, input: UpdateUserProfileInput){
        const user = await UserModel.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        if(user.status !== "active"){
            throw new ApiError(403, "Your account is blocked")
        }
        if(input.name !== undefined){
            user.name = input.name;
        }
        if(input.profileImage !== undefined){
            user.profileImage = input.profileImage;
        }

        await user.save();
        return toSafeUser(user);
    }

    // Change passsword service
    async changePassword(userId: string, input: ChangePasswordInput){
        const user = await UserModel.findById(userId).select("+passwordHash")
        if(!user){
            throw new ApiError(404, "User not found");
        }
        if(user.status !== "active"){
            throw new ApiError(403, "Your account is blocked");
        }
        if (!user.passwordHash) {
           throw new ApiError(500, "Password hash is missing");
        }
         const isCurrentPasswordValid = await bcrypt.compare( input.currentPassword,user.passwordHash);
        if(!isCurrentPasswordValid){
            throw new ApiError(401, "Current password is incorrect");
        }
        user.passwordHash = input.newPassword;
        user.tokenVersion += 1;
        await user.save();
        return true;
    }

    async logoutUser(userId: string){
        const user = await UserModel.findByIdAndUpdate(
            userId,
        {
          $inc: { tokenVersion: 1 },
        },
        {
          new: true,
        }
        ).select("_id");
        if(!user){
             throw new ApiError(404, "User not found");
        }
        return true;
    }
}

export default new UserService();