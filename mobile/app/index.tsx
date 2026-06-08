// Root route — immediately forwards to /home so no extra splash screen
// flashes between the branded AppLoading and the actual app.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/home" />;
}
