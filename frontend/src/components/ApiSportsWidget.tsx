
import React, { useEffect, useRef } from 'react';

// Extend JSX elements to include the custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'api-sports-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                'data-type'?: string;
                'data-key'?: string;
                'data-sport'?: string;
                'data-lang'?: string;
                'data-theme'?: string;
                'data-timezone'?: string;
                'data-show-errors'?: string;
                'data-show-logos'?: string;
                'data-favorite'?: string;
                'data-date'?: string;
                'data-league'?: string;
                'data-country'?: string;
                'data-refresh'?: string;
                'data-games-style'?: string;
                'data-tab'?: string;
                'data-show-toolbar'?: string;
            };
        }
    }
}

interface ApiSportsWidgetProps {
    type: 'games' | 'standings' | 'team' | 'player' | 'fixture' | 'league' | 'livescore' | 'config';
    apiKey?: string;
    sport?: string;
    lang?: string;
    theme?: string;
    timezone?: string;
    showErrors?: boolean;
    showLogos?: boolean;
    favorite?: boolean;
    date?: string;
    leagueId?: string;
    country?: string;
    refreshInterval?: number;
    gamesStyle?: '1' | '2';
    tab?: 'all' | 'live' | 'upcoming' | 'finished';
    showToolbar?: boolean;
    className?: string;
}

export const ApiSportsWidget: React.FC<ApiSportsWidgetProps> = ({
    type,
    apiKey,
    sport = 'football',
    lang = 'en',
    theme = 'white',
    timezone = 'ASIA',
    showErrors = true,
    showLogos = true,
    favorite = true,
    date,
    leagueId,
    country,
    refreshInterval,
    gamesStyle,
    tab,
    showToolbar,
    className
}) => {
    const widgetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // The widget script might need to re-scan the DOM when components mount/update
        // However, usually just rendering the custom element is enough if the script is loaded.
    }, []);

    return (
        <api-sports-widget
            ref={widgetRef}
            className={className}
            data-type={type}
            {...(apiKey && { 'data-key': apiKey })}
            {...(sport && { 'data-sport': sport })}
            {...(lang && { 'data-lang': lang })}
            {...(theme && { 'data-theme': theme })}
            {...(timezone && { 'data-timezone': timezone })}
            {...(showErrors !== undefined && { 'data-show-errors': showErrors.toString() })}
            {...(showLogos !== undefined && { 'data-show-logos': showLogos.toString() })}
            {...(favorite !== undefined && { 'data-favorite': favorite.toString() })}
            {...(date && { 'data-date': date })}
            {...(leagueId && { 'data-league': leagueId })}
            {...(country && { 'data-country': country })}
            {...(refreshInterval && { 'data-refresh': refreshInterval.toString() })}
            {...(gamesStyle && { 'data-games-style': gamesStyle })}
            {...(tab && { 'data-tab': tab })}
            {...(showToolbar !== undefined && { 'data-show-toolbar': showToolbar.toString() })}
        ></api-sports-widget>
    );
};
