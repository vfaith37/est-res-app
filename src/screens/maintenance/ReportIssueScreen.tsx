import { useState } from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaintenanceStackParamList } from '@/types/navigation';
import { useCreateMaintenanceRequestMutation } from '@/store/api/maintenanceApi';
import { haptics } from '@/utils/haptics';

type ReportIssueScreenNavigationProp = NativeStackNavigationProp<
	MaintenanceStackParamList,
	'ReportIssue'
>;

type Props = {
	navigation: ReportIssueScreenNavigationProp;
};

const CATEGORIES = [
	{ value: 'plumbing', label: 'Plumbing', icon: 'water' },
	{ value: 'electrical', label: 'Electrical', icon: 'flash' },
	{ value: 'cleaning', label: 'Cleaning', icon: 'sparkles' },
	{ value: 'carpentry', label: 'Carpentry', icon: 'hammer' },
	{ value: 'hvac', label: 'HVAC', icon: 'snow' },
	{ value: 'other', label: 'Other', icon: 'construct' },
];

const PRIORITIES = ['low', 'medium', 'high', 'emergency'];

export default function ReportIssueScreen({ navigation }: Props) {
	const [category, setCategory] = useState<any>('plumbing');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [location, setLocation] = useState('');
	const [priority, setPriority] = useState<any>('medium');

	const [createRequest, { isLoading }] = useCreateMaintenanceRequestMutation();

	const handleSubmit = async () => {
		if (!title || !description || !location) {
			haptics.error();
			Alert.alert('Error', 'Please fill in all required fields');
			return;
		}

		try {
			haptics.light();
			await createRequest({
				category,
				title,
				description,
				location,
				priority,
			}).unwrap();

			haptics.success();
			Alert.alert('Success', 'Maintenance request submitted', [
				{ text: 'OK', onPress: () => navigation.goBack() },
			]);
		} catch (error: any) {
			haptics.error();
			Alert.alert('Error', error?.data?.message || 'Failed to submit request');
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={['bottom']}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}
			>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<View style={styles.form}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Category *</Text>
							<View style={styles.categoryContainer}>
								{CATEGORIES.map((cat) => (
									<TouchableOpacity
										key={cat.value}
										style={[
											styles.categoryButton,
											category === cat.value && styles.categoryButtonActive,
										]}
										onPress={() => {
											haptics.light();
											setCategory(cat.value);
										}}
										disabled={isLoading}
									>
										<Ionicons
											name={cat.icon as any}
											size={24}
											color={category === cat.value ? '#fff' : '#007AFF'}
										/>
										<Text
											style={[
												styles.categoryText,
												category === cat.value && styles.categoryTextActive,
											]}
										>
											{cat.label}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Title *</Text>
							<TextInput
								style={styles.input}
								placeholder="Brief description of the issue"
								value={title}
								onChangeText={setTitle}
								editable={!isLoading}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Description *</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								placeholder="Detailed description of the issue"
								value={description}
								onChangeText={setDescription}
								multiline
								numberOfLines={4}
								editable={!isLoading}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Location *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., Kitchen, Bathroom, Living room"
								value={location}
								onChangeText={setLocation}
								editable={!isLoading}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Priority *</Text>
							<View style={styles.priorityContainer}>
								{PRIORITIES.map((p) => (
									<TouchableOpacity
										key={p}
										style={[
											styles.priorityButton,
											priority === p && styles.priorityButtonActive,
											{ borderColor: getPriorityColor(p) },
											priority === p && { backgroundColor: getPriorityColor(p) },
										]}
										onPress={() => {
											haptics.light();
											setPriority(p);
										}}
										disabled={isLoading}
									>
										<Text
											style={[
												styles.priorityText,
												{ color: priority === p ? '#fff' : getPriorityColor(p) },
											]}
										>
											{p.charAt(0).toUpperCase() + p.slice(1)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<TouchableOpacity
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.buttonText}>Submit Request</Text>
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

function getPriorityColor(priority: string) {
	switch (priority) {
		case 'low':
			return '#34C759';
		case 'medium':
			return '#FF9500';
		case 'high':
			return '#FF3B30';
		case 'emergency':
			return '#8B0000';
		default:
			return '#8E8E93';
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F2F2F7',
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
	form: {
		gap: 20,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
	},
	input: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#E5E5EA',
		borderRadius: 10,
		padding: 16,
		fontSize: 16,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	categoryContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	categoryButton: {
		flex: 1,
		minWidth: '30%',
		backgroundColor: '#fff',
		borderWidth: 2,
		borderColor: '#007AFF',
		borderRadius: 10,
		padding: 12,
		alignItems: 'center',
		gap: 4,
	},
	categoryButtonActive: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	categoryText: {
		fontSize: 12,
		color: '#007AFF',
		fontWeight: '600',
	},
	categoryTextActive: {
		color: '#fff',
	},
	priorityContainer: {
		flexDirection: 'row',
		gap: 8,
	},
	priorityButton: {
		flex: 1,
		backgroundColor: '#fff',
		borderWidth: 2,
		borderRadius: 10,
		padding: 12,
		alignItems: 'center',
	},
	priorityButtonActive: {
		borderWidth: 2,
	},
	priorityText: {
		fontSize: 14,
		fontWeight: '600',
	},
	footer: {
		padding: 16,
		backgroundColor: '#F2F2F7',
		borderTopWidth: 1,
		borderTopColor: '#E5E5EA',
	},
	button: {
		backgroundColor: '#007AFF',
		padding: 16,
		borderRadius: 10,
		alignItems: 'center',
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});
