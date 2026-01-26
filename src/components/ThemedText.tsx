import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';

/**
 * A themed text component that enforces consistent font scaling limits across the app.
 * This helps prevent layout issues on Android devices with large system font settings.
 */
export function ThemedText(props: TextProps) {
    const { style, ...otherProps } = props;

    let formattedStyle = style;

    // On Android, reduce font size by 20% to match user expectation of "smaller"
    if (Platform.OS === 'android') {
        const flattened = StyleSheet.flatten(style);
        if (flattened && typeof flattened === 'object' && 'fontSize' in flattened) {
            const currentSize = (flattened as any).fontSize;
            if (typeof currentSize === 'number') {
                formattedStyle = [style, { fontSize: currentSize * 0.8 }];
            }
        }
    }

    return (
        <Text
            {...otherProps}
            allowFontScaling={Platform.OS === 'ios'}
            style={formattedStyle}
        />
    );
}

const styles = StyleSheet.create({
    // Add any default styles here if needed in the future
});
