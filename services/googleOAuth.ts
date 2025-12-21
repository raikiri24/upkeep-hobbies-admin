// Google OAuth configuration using new Google Identity Services (GIS)
export const GOOGLE_CONFIG = {
  clientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "",
  scope: "email profile",
  redirectUri: window.location.origin,
};

// API Configuration
export const API_CONFIG = {
  baseUrl:
    "https://lkjnw31n3f.execute-api.ap-northeast-1.amazonaws.com/staging",
  timeout: 10000,
};

// Application Configuration
export const APP_CONFIG = {
  name: (import.meta as any).env?.VITE_APP_NAME || "UPKEEP HOBBIES ADMIN",
  version: (import.meta as any).env?.VITE_APP_VERSION || "1.0.0",
  environment: (import.meta as any).env?.MODE || "development",
};

// Google OAuth helper functions using new Google Identity Services
export class GoogleOAuthService {
  private static instance: GoogleOAuthService;
  private google: any = null;
  private isInitialized = false;

  static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google Identity Services
      await this.loadGoogleIdentityServices();

      // Initialize Google Identity Services
      this.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Google Identity Services:", error);
      throw error;
    }
  }

  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.google = window.google;
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.google = window.google;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private handleCredentialResponse(response: any): void {
    // This callback is used for the automatic flow
    // For manual flow, we'll use the popup method
    console.log("Google credential response:", response);
  }

  async signIn(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Use the new Google Identity Services popup method
      return new Promise((resolve, reject) => {
        this.google.accounts.oauth2
          .initTokenClient({
            client_id: GOOGLE_CONFIG.clientId,
            scope: GOOGLE_CONFIG.scope,
            callback: (response: any) => {
              if (response.access_token) {
                // Get user info using the access token
                this.fetchUserInfo(response.access_token)
                  .then((userInfo) => {
                    resolve({
                      ...userInfo,
                      token: response.access_token,
                      expires_at: Date.now() + response.expires_in * 1000,
                    });
                  })
                  .catch(reject);
              } else if (response.error) {
                reject(new Error(response.error_description || response.error));
              } else {
                reject(new Error("Failed to obtain access token"));
              }
            },
            error_callback: (error: any) => {
              reject(
                new Error(
                  error.error_description || error.error || "OAuth flow failed"
                )
              );
            },
          })
          .requestAccessToken();
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  private async fetchUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userInfo = await response.json();

      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        verified_email: userInfo.verified_email,
      };
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Revoke token if we have one stored
      if (ACCESS_TOKEN) {
        this.google.accounts.oauth2.revoke(ACCESS_TOKEN);
        ACCESS_TOKEN = null;
      }
    } catch (error) {
      console.error("Google sign-out error:", error);
      // Don't throw error for sign-out failures
    }
  }

  isConfigured(): boolean {
    return !!GOOGLE_CONFIG.clientId;
  }
}

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

// Store access token globally for revocation
let ACCESS_TOKEN: string | null = null;
