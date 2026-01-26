import React from 'react';
import { TextInput, TextInputProps, StyleSheet, Platform } from 'react-native';

/**
 * A themed text input component that disabled font scaling and reduces font size on Android.
 */
/**
 * A themed text input component that disabled font scaling and reduces font size on Android.
 */
export function ThemedTextInput(props: TextInputProps & { ref?: React.Ref<TextInput> }) {
    // In React 19, we can access ref from props
    const { style, ref, ...otherProps } = props;

    let formattedStyle = style;

    // On Android, reduce font size by 20%
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
        <TextInput
            ref={ref}
            {...otherProps}
            allowFontScaling={Platform.OS === 'ios'}
            style={formattedStyle}
        />
    );
}

const styles = StyleSheet.create({});
