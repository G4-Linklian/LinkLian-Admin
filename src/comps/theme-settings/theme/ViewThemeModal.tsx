import {
    Modal,
    Text,
    Group,
    Image,
    Stack,
    Badge,
    Divider,
} from "@mantine/core";
import { themeSettingsFields } from "@/utils/interface/themeSettings.types";
import { formatDate } from "@/config/formatters";

interface ViewThemeModalProps {
    theme: themeSettingsFields | null;
    opened: boolean;
    close: () => void;
}

export default function ViewThemeModal({
    theme,
    opened,
    close,
}: ViewThemeModalProps) {
    if (!theme) return null;

    const statusMap: Record<string, { label: string; color: string }> = {
        active: {
            label: "กำลังใช้งาน",
            color: "green",
        },
        pending: {
            label: "รอดำเนินการ",
            color: "yellow",
        },
        completed: {
            label: "เสร็จสิ้น",
            color: "gray",
        }
    };

    const statusConfig = statusMap[theme.status || 'pending'] || statusMap.pending;

    return (
        <Modal
            opened={opened}
            onClose={close}
            centered
            size="md"
            radius={16}
            padding={32}
            title={
                <Text fw={700} size="lg">
                    รายละเอียดธีม
                </Text>
            }
        >
            <Stack gap="md">
                <Group gap="xs">
                    <Badge variant="light" color={statusConfig.color} size="lg">
                        {statusConfig.label}
                    </Badge>
                </Group>

                <div
                    style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    <Image
                        src={theme.theme_url}
                        alt={theme.theme_name}
                        h={200}
                        fit="cover"
                        fallbackSrc="https://placehold.co/600x400?text=No+Image"
                    />
                </div>

                <Stack gap="sm">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">ชื่อธีม:</Text>
                        <Text size="sm" fw={500}>{theme.theme_name || '-'}</Text>
                    </Group>

                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">วันเริ่มต้น:</Text>
                        <Text size="sm" fw={500}>
                            {theme.is_default || !theme.start_date ? '-' : formatDate(theme.start_date)}
                        </Text>
                    </Group>

                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">วันสิ้นสุด:</Text>
                        <Text size="sm" fw={500}>
                            {theme.is_default || !theme.end_date ? '-' : formatDate(theme.end_date)}
                        </Text>
                    </Group>

                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">URL รูปภาพ:</Text>
                        <Text
                            size="sm"
                            fw={500}
                            style={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={theme.theme_url}
                        >
                            {theme.theme_url || '-'}
                        </Text>
                    </Group>
                </Stack>
            </Stack>
        </Modal>
    );
}
