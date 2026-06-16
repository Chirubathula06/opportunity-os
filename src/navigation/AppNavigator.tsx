import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileBuilderScreen } from '../screens/ProfileBuilderScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { AIMatchScreen } from '../screens/AIMatchScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OpportunityDetailScreen } from '../screens/OpportunityDetailScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { DiscoveryLogsScreen } from '../screens/DiscoveryLogsScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  ProfileBuilder: undefined;
  MainTabs: undefined;
  OpportunityDetail: { opportunityId: string };
  EditProfile: undefined;
  DiscoveryLogs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  AIMatch: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#020617',
    card: '#08111f',
    text: '#ffffff',
    border: 'rgba(255,255,255,0.08)'
  }
};

function LoadingBoot() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#020617',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <ActivityIndicator color="#67e8f9" size="large" />
      <Text style={{ color: '#94a3b8', marginTop: 16 }}>
        Loading Opportunity OS...
      </Text>
    </View>
  );
}

function getTabIcon(routeName: keyof MainTabParamList, focused: boolean) {
  if (routeName === 'Home') return focused ? 'home' : 'home-outline';
  if (routeName === 'Explore') return focused ? 'search' : 'search-outline';
  if (routeName === 'AIMatch') return focused ? 'sparkles' : 'sparkles-outline';
  if (routeName === 'Saved') return focused ? 'bookmark' : 'bookmark-outline';

  return focused ? 'person' : 'person-outline';
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getTabIcon(route.name as keyof MainTabParamList, focused)}
            size={size}
            color={color}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(8,17,31,0.96)',
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 72,
          paddingBottom: 12,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#67e8f9',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800'
        }
      })}
    >
      <Tabs.Screen name="Home" component={DashboardScreen} />
      <Tabs.Screen name="Explore" component={ExploreScreen} />
      <Tabs.Screen
        name="AIMatch"
        component={AIMatchScreen}
        options={{ title: 'AI Match' }}
      />
      <Tabs.Screen name="Saved" component={SavedScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingBoot />;

  const isLoggedIn = !!session?.user;
  const hasProfile = !!profile;
  const profileCompleted = profile?.profile_completed === true;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : !hasProfile ? (
  <Stack.Screen name="ProfileBuilder" component={ProfileBuilderScreen} />
) : !profileCompleted ? (
          <Stack.Screen
            name="ProfileBuilder"
            component={ProfileBuilderScreen}
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="OpportunityDetail"
              component={OpportunityDetailScreen}
            />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen
              name="DiscoveryLogs"
              component={DiscoveryLogsScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}