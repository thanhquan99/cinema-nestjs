import { Country } from './../movie.entity';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(Country, {
    message: `Country should be in [${Country.AM},${Country.VN}]`,
  })
  country: Country;

  @IsNotEmpty()
  @IsString()
  producer: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  releaseDate: Date;

  @IsNotEmpty()
  @IsNumberString()
  duration: number;

  @IsOptional()
  @IsString()
  actorIds: string;

  @IsOptional()
  @IsString()
  directorIds: string;

  @IsOptional()
  @IsString()
  genreIds: string;
}
