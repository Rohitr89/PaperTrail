package com.example.PaperTrail.Security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// This is the file that actually turns on Spring Security's rules and plugs
// JwtAuthenticationFilter into the request pipeline. Nothing we built so far
// runs automatically — this is what wires it together.
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http

//         CSRF protection defends against browser-form-based attacks that rely on cookies/sessions.
//         We don't use sessions or cookies for auth (JWT in a header instead), so CSRF doesn't apply here.
                .csrf(csrf ->csrf.disable())

//                 Tell Spring Security not to create or use HTTP sessions at all.
//                 Every request must prove who it is via the JWT, every single time — no server-side login state.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
//                        Anyone can hit register/login — you don't have a token yet when calling these.
                        .requestMatchers("/api/auth/**").permitAll()

//                Every other endpoint needs a required valid authentication request
                .anyRequest().authenticated())
//         Insert our custom filter BEFORE Spring's default username/password filter.
//         This is what makes JwtAuthenticationFilter actually run on every request —
//         without this line, the filter class exists but Spring never calls it.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();

//         Shared bean version of the encoder — AuthController currently instantiates its own
//         BCryptPasswordEncoder directly. Once this bean exists, we should inject this instead
//         so there's only ever one password-hashing strategy defined in the whole app.
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
//     Exposed in case we ever need to authenticate programmatically via Spring's own
//     AuthenticationManager (not currently used — AuthController checks passwords manually).
//     Harmless to have; not wrong to skip if you want to keep this file leaner.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
        return config.getAuthenticationManager();
    }
}
