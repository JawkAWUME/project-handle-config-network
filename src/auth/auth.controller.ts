import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Équivalent: Route::post('/login', [AuthController::class, 'login'])
   */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      success: true,
      message: 'Connexion réussie',
      data: result,
    };
  }

  /**
   * POST /api/auth/register
   * Équivalent: Route::post('/register', [AuthController::class, 'register'])
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      success: true,
      message: 'Compte créé avec succès',
      data: result,
    };
  }

  /**
   * POST /api/auth/logout
   * Équivalent: Route::post('/logout', [AuthController::class, 'logout'])
   * En JWT, le logout est côté client (supprimer le token).
   * Ici on confirme juste que la requête est authentifiée.
   */
  @Post('logout')
  async logout(@Request() req) {
    return {
      success: true,
      message: 'Déconnexion réussie. Supprimez le token côté client.',
    };
  }

  /**
   * GET /api/auth/me
   * Retourne l'utilisateur authentifié courant
   */
  @Get('me')
  async me(@Request() req) {
    return {
      success: true,
      data: req.user,
    };
  }
}