import { Modal, Text, Group, Stack, Badge, Image, Divider, Grid, Paper, Anchor } from "@mantine/core";
import { IconMail, IconPhone, IconWorld, IconMapPin, IconBuilding, IconFileText } from "@tabler/icons-react";
import { institutionFields } from "@/utils/interface/institution.types";
import { mapInstitutionType } from '@/utils/function/institutionType';

interface ViewInstitutionModalProps {
    institution: institutionFields | null;
    opened: boolean;
    close: () => void;
}

export default function ViewInstitutionModal({
    institution,
    opened,
    close,
}: ViewInstitutionModalProps) {
    if (!institution) return null;

    const statusMap: Record<string, { label: string; color: string }> = {
        approved: { label: "อนุมัติ", color: "green" },
        rejected: { label: "ปฏิเสธ", color: "red" },
        pending: { label: "รอการอนุมัติ", color: "yellow" },
    };

    const statusKey = (institution.approve_status === 'approved' || institution.approve_status === 'rejected'
        ? institution.approve_status
        : 'pending') as 'pending' | 'approved' | 'rejected';
    const status = statusMap[statusKey] || statusMap.pending;

    const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => (
        <Group gap="sm" align="flex-start">
            <Icon size={18} stroke={1.5} color="#6b7280" style={{ marginTop: 2 }} />
            <div>
                <Text size="xs" c="dimmed">{label}</Text>
                <Text size="sm" fw={500}>{value || "-"}</Text>
            </div>
        </Group>
    );

    return (
        <Modal
            opened={opened}
            onClose={close}
            title={
                <Text fw={600} size="lg">รายละเอียดสถาบัน</Text>
            }
            size="lg"
            centered
            radius={16}
            padding={32}
        >
            <Stack gap="md">
                {/* Header Section with Logo */}
                <Paper p="md" radius="md" withBorder>
                    <Group align="flex-start" gap="lg">
                        {institution.logo_url ? (
                            <Image
                                src={institution.logo_url}
                                alt="Institution Logo"
                                w={80}
                                h={80}
                                radius="md"
                                fit="contain"
                                fallbackSrc="https://placehold.co/80x80?text=Logo"
                            />
                        ) : (
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 8,
                                    backgroundColor: "#f3f4f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <IconBuilding size={32} color="#9ca3af" />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <Group justify="space-between" align="flex-start">
                                <div>
                                    <Text fw={600} size="lg">{institution.inst_name_th || "-"}</Text>
                                    <Text size="sm" c="dimmed">{institution.inst_name_en || "-"}</Text>
                                </div>
                                <Badge color={status.color} variant="light" size="lg">
                                    {status.label}
                                </Badge>
                            </Group>
                            <Group gap="xs" mt="xs">
                                <Badge variant="outline" color="gray" size="sm">
                                    {institution.inst_abbr_th || "-"}
                                </Badge>
                                {institution.inst_abbr_en && (
                                    <Badge variant="outline" color="gray" size="sm">
                                        {institution.inst_abbr_en}
                                    </Badge>
                                )}
                                {institution.inst_type && (
                                    <Badge variant="light" color="blue" size="sm">
                                        {mapInstitutionType(institution.inst_type)}
                                    </Badge>
                                )}
                            </Group>
                        </div>
                    </Group>
                </Paper>

                {/* Contact Information */}
                <div>
                    <Text fw={500} size="sm" mb="sm" c="dimmed">ข้อมูลการติดต่อ</Text>
                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <InfoItem icon={IconMail} label="อีเมล" value={institution.inst_email} />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <InfoItem icon={IconPhone} label="เบอร์โทรศัพท์" value={institution.inst_phone} />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group gap="sm" align="flex-start">
                                <IconWorld size={18} stroke={1.5} color="#6b7280" style={{ marginTop: 2 }} />
                                <div>
                                    <Text size="xs" c="dimmed">เว็บไซต์</Text>
                                    {institution.website ? (
                                        <Anchor href={institution.website} target="_blank" size="sm" fw={500}>
                                            {institution.website}
                                        </Anchor>
                                    ) : (
                                        <Text size="sm" fw={500}>-</Text>
                                    )}
                                </div>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </div>

                <Divider />

                {/* Address Information */}
                <div>
                    <Text fw={500} size="sm" mb="sm" c="dimmed">ที่อยู่</Text>
                    <Paper p="sm" radius="md" bg="gray.0">
                        <Group gap="sm" align="flex-start">
                            <IconMapPin size={18} stroke={1.5} color="#6b7280" style={{ marginTop: 2 }} />
                            <div>
                                <Text size="sm" fw={500}>
                                    {institution.address || "-"}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {[
                                        institution.subdistrict && `ตำบล/แขวง ${institution.subdistrict}`,
                                        institution.district && `อำเภอ/เขต ${institution.district}`,
                                        institution.province && `จังหวัด ${institution.province}`,
                                        institution.postal_code
                                    ].filter(Boolean).join(" ") || "-"}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                </div>

                {/* Documents */}
                {institution.docs_url && (
                    <>
                        <Divider />
                        <div>
                            <Text fw={500} size="sm" mb="sm" c="dimmed">เอกสารแนบ</Text>
                            <Group gap="sm">
                                <IconFileText size={18} stroke={1.5} color="#6b7280" />
                                <Anchor href={institution.docs_url} target="_blank" size="sm">
                                    ดูเอกสาร
                                </Anchor>
                            </Group>
                        </div>
                    </>
                )}

            </Stack>
        </Modal>
    );
}
