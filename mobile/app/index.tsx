import { Redirect } from 'expo-router';

// Entry gate. Once AuthContext lands, this redirects by session/role
// (customer tabs · vendor tabs · landing). Until then, everyone starts
// at the public landing screen.
export default function Index() {
  return <Redirect href="/landing" />;
}
