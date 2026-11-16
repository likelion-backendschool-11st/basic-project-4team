import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { changeMyNickname, changeMyPassword } from '../../api/mypage';
import type { MyProfile } from '../../api/types';
import { AUTH_RULES } from '../../data/auth';
import { mySettingsCopy as copy } from '../../data/mypage';
import { hasFieldErrors, isValidPassword, toAuthErrorMessage, type AuthFeedback, type FieldErrors } from '../auth/authFormHelpers';

const useMounted = () => {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
};

/** 닉네임 변경 폼. 30일 제한 중이면 locked. */
export const useNicknameForm = (profile: MyProfile, onUpdated: (profile: MyProfile) => void) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const mounted = useMounted();
  const locked = profile.nicknameChangeAvailableAt !== null;

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setError(undefined);
  }, []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting || locked) return;
      const trimmed = nickname.trim();
      if (!trimmed || trimmed.length > AUTH_RULES.nicknameMax || /\s{2,}/.test(trimmed)) {
        setError(copy.nicknameError);
        return;
      }
      if (trimmed === profile.nickname) {
        setError(copy.nicknameSame);
        return;
      }
      setFeedback(null);
      setSubmitting(true);
      try {
        const updated = await changeMyNickname(trimmed);
        if (!mounted.current) return;
        onUpdated(updated);
        setNickname('');
        setFeedback({ kind: 'success', title: copy.nicknameDone, message: '' });
      } catch (err) {
        if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [locked, mounted, nickname, onUpdated, profile.nickname, submitting],
  );

  return { nickname, error, submitting, feedback, locked, onChange, onSubmit };
};

export type PasswordChangeField = 'currentPassword' | 'newPassword' | 'newPasswordConfirm';

export type PasswordChangeValues = Readonly<Record<PasswordChangeField, string>>;

const EMPTY_PASSWORDS: PasswordChangeValues = { currentPassword: '', newPassword: '', newPasswordConfirm: '' };

const isPasswordField = (name: string): name is PasswordChangeField => name in EMPTY_PASSWORDS;

/** 비밀번호 변경 폼. */
export const usePasswordChangeForm = () => {
  const [values, setValues] = useState<PasswordChangeValues>(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<FieldErrors<PasswordChangeField>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const mounted = useMounted();

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!isPasswordField(name)) return;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const nextErrors: FieldErrors<PasswordChangeField> = {
        currentPassword: values.currentPassword ? undefined : copy.currentPasswordError,
        newPassword: isValidPassword(values.newPassword) ? undefined : copy.newPasswordError,
        newPasswordConfirm:
          values.newPasswordConfirm && values.newPasswordConfirm === values.newPassword
            ? undefined
            : copy.newPasswordConfirmError,
      };
      setErrors(nextErrors);
      if (hasFieldErrors(nextErrors)) return;
      setFeedback(null);
      setSubmitting(true);
      try {
        await changeMyPassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
        if (!mounted.current) return;
        setValues(EMPTY_PASSWORDS);
        setFeedback({ kind: 'success', title: copy.passwordDone, message: '' });
      } catch (err) {
        if (mounted.current) setFeedback({ kind: 'error', message: toAuthErrorMessage(err) });
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [mounted, submitting, values],
  );

  return { values, errors, showPassword, submitting, feedback, onChange, togglePassword, onSubmit };
};
