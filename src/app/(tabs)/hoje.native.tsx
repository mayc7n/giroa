import TodayScreen from '@/features/today/TodayScreen';
import BackupActions from '@/features/backup/BackupActions';

export default function TodayNativeScreen() {
  return <TodayScreen footer={<BackupActions />} />;
}
