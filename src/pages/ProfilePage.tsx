import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setUser } from '@/features/auth/authSlice';
import { userApi, getApiErrorMessage, USER_STORAGE_KEY, TOKEN_STORAGE_KEY } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Lock,
  Save,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

// Zod schema for Password Change
const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'New passwords do not match',
    path: ['confirm_password'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Zod schema for Profile Details
const profileDetailsSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(50).optional(),
});

type ProfileDetailsFormData = z.infer<typeof profileDetailsSchema>;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Edit Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileDetailsFormData>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  });

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  // Display calculations
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    'Super Admin';

  const avatarLetter = (
    user?.first_name?.trim().charAt(0) ||
    user?.name?.trim().charAt(0) ||
    user?.email?.trim().charAt(0) ||
    'A'
  ).toUpperCase();

  // Handle Profile Details Update
  const onProfileSubmit = async (data: ProfileDetailsFormData) => {
    try {
      setIsUpdatingProfile(true);
      const res = await userApi.updateProfile({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone?.trim() || null,
      });

      const updatedUser = res.data.data;
      const normalizedUser = {
        ...user,
        ...updatedUser,
        name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || displayName,
      };

      dispatch(setUser(normalizedUser));

      // Update storage
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      } else if (sessionStorage.getItem(TOKEN_STORAGE_KEY)) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      }

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsChangingPassword(true);
      const res = await userApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      toast.success(res.data.message || 'Password updated successfully!');
      resetPasswordForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change password.'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/15 via-primary/5 to-secondary/15" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
                {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl uppercase">
                  {avatarLetter}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {displayName}
                  </h1>
                  <Badge variant="secondary" className="gap-1 font-mono text-[11px] capitalize">
                    <Shield className="h-3 w-3 text-primary" />
                    {user?.role?.replace('_', ' ') || 'Super Admin'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email || 'admin@gmail.com'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 gap-1 border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                Active Account
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information Form */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your public account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-xs font-semibold">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Super"
                    disabled={isUpdatingProfile}
                    {...registerProfile('first_name')}
                  />
                  {profileErrors.first_name && (
                    <p className="text-xs text-destructive">{profileErrors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-xs font-semibold">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Admin"
                    disabled={isUpdatingProfile}
                    {...registerProfile('last_name')}
                  />
                  {profileErrors.last_name && (
                    <p className="text-xs text-destructive">{profileErrors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-9 bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Email address cannot be modified directly from this portal.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    disabled={isUpdatingProfile}
                    className="pl-9"
                    {...registerProfile('phone')}
                  />
                </div>
                {profileErrors.phone && (
                  <p className="text-xs text-destructive">{profileErrors.phone.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile || !isProfileDirty}
                  className="w-full gap-2 font-medium"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Security & Password</CardTitle>
                <CardDescription>Change your account password securely</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="current_password" className="text-xs font-semibold">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    disabled={isChangingPassword}
                    {...registerPassword('current_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="text-xs text-destructive">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <Separator />

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new_password" className="text-xs font-semibold">
                  New Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className="pl-9 pr-10"
                    disabled={isChangingPassword}
                    {...registerPassword('new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="text-xs text-destructive">{passwordErrors.new_password.message}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-semibold">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    className="pl-9 pr-10"
                    disabled={isChangingPassword}
                    {...registerPassword('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirm_password && (
                  <p className="text-xs text-destructive">{passwordErrors.confirm_password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full gap-2 font-medium"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

