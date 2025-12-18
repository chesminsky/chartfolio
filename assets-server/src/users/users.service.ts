import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import * as FacebookProfile from 'passport-facebook';
import * as GoogleProfile from 'passport-google-oauth20';
import { AssetsService } from 'src/assets/assets.service';
import { Provider } from 'src/auth/auth.service';
import { CategoriesService } from 'src/categories/categories.service';
import { Errors } from 'src/errors-enum';
import { defaultWallet } from './data/assets';
import { CategoryMap, CreateUserDto, SettingsMap } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private assetsService: AssetsService,
    private categoriesService: CategoriesService,
    private configService: ConfigService
  ) {}

  async registerOAuthUser(profile: GoogleProfile.Profile | FacebookProfile.Profile, provider: Provider): Promise<User> {
    const userDTO: CreateUserDto = {
      username: profile.displayName,
      picture: profile.photos && profile.photos[0] && profile.photos[0].value,
      email: profile.emails && profile.emails[0] && profile.emails[0].value,
      verified: true
    };

    if (provider === Provider.GOOGLE) {
      return this.create({
        ...userDTO,
        googleId: profile.id
      });
    }
    if (provider === Provider.FACEBOOK) {
      return this.create({
        ...userDTO,
        facebookId: profile.id
      });
    }
    return null;
  }

  async updateOAuthUser(
    userId: string,
    profile: GoogleProfile.Profile | FacebookProfile.Profile,
    provider: Provider
  ): Promise<User> {
    const userDto = {
      username: profile.displayName,
      picture: profile.photos && profile.photos[0] && profile.photos[0].value,
      verified: true,
      emailToken: null
    };
    if (provider === Provider.GOOGLE) {
      return this.userModel.findByIdAndUpdate(userId, { ...userDto, googleId: profile.id }, { new: true }).exec();
    }
    if (provider === Provider.FACEBOOK) {
      return this.userModel.findByIdAndUpdate(userId, { ...userDto, facebookId: profile.id }, { new: true }).exec();
    }
    return null;
  }

  async findOneByThirdPartyId(thirdPartyId: string, provider: Provider): Promise<User> {
    if (provider === Provider.GOOGLE) {
      return this.userModel.findOne({ googleId: thirdPartyId }).exec();
    }
    if (provider === Provider.FACEBOOK) {
      return this.userModel.findOne({ facebookId: thirdPartyId }).exec();
    }
    return null;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async confirmEmailByToken(emailToken: string): Promise<User> {
    return this.userModel.findOneAndUpdate({ emailToken }, { verified: true, emailToken: null }).exec();
  }

  async getByToken(emailToken: string): Promise<User> {
    return this.userModel.findOne({ emailToken }).exec();
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id).lean();
  }

  async setPassword(email: string, password: string): Promise<boolean> {
    if (!password) {
      throw new BadRequestException({
        message: Errors.AUTH_NO_PASSWORD_PROVIDED
      });
    }

    const salt = await bcrypt.genSalt();
    const hash: string = await bcrypt.hash(password, salt);

    try {
      await this.userModel
        .findOneAndUpdate({ email: email.toLowerCase() }, { password: hash, emailToken: null })
        .exec();
      return true;
    } catch (error) {
      throw new NotFoundException({
        message: Errors.AUTH_USER_NOT_FOUND
      });
    }
  }

  async addEmailToken(email: string): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          emailToken: (Math.floor(Math.random() * 9000000) + 1000000).toString(), //Generate 7 digits number
          updated: new Date()
        },
        { new: true }
      )
      .exec();
  }

  async updateCategoryMap(userId: string, categoryMap: CategoryMap): Promise<CategoryMap> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { categoryMap: JSON.stringify(categoryMap) }, { new: true })
      .exec();
    return JSON.parse(updatedUser.categoryMap);
  }

  async updateSettingsMap(userId: string, settingsMap: SettingsMap): Promise<SettingsMap> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { settingsMap: JSON.stringify(settingsMap) }, { new: true })
      .exec();
    return JSON.parse(updatedUser.settingsMap);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userModel.create({
      ...createUserDto,
      categoryMap: '{}',
      settingsMap: '{}'
    });

    await this.assetsService.create(defaultWallet, user['_id']);

    this.sendEmail(
      'New user registered',
      `New user registered with email ${user.email}, username ${user.username}, id ${user._id}`
    );

    return user;
  }

  async upgradePlan(userId: string, hash: string, currency: string): Promise<boolean> {
    return this.sendEmail('User requested PRO account', `User with id ${userId} paid via ${currency}, hash ${hash}`);
  }

  private async sendEmail(subject: string, html: string): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS')
      }
    });

    const mailOptions = {
      from: '"Chartfolio" <' + this.configService.get<string>('MAIL_USER') + '>',
      to: 'chesminsky@gmail.com',
      subject,
      html
    };

    const sent = await new Promise<boolean>(async function (resolve, reject) {
      return await transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log('Message sent: %s', error);
          return reject(false);
        }
        console.log('Message sent: %s', info.messageId);
        resolve(true);
      });
    });

    return sent;
  }
}
