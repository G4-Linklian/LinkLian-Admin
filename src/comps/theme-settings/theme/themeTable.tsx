import { useState, useRef, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center,
    TextInput,
    ActionIcon,
    Tooltip,
    Button,
    Group,
    Image
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconFilter, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { formatDate, normalizeDate } from "@/config/formatters";
import { getTheme, createTheme, updateTheme, deleteTheme } from '@/utils/api/themeSettings';
import { themeSettingsFields } from '@/utils/interface/themeSettings.types';
import { useNotification } from '@/comps/noti/notiComp';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import AddThemeModal from './AddThemeModal';
import EditThemeModal from './EditThemeModal';
import ViewThemeModal from './ViewThemeModal';

const BATCH_SIZE = 20;

export default function ThemeSettingsDashboard() {
    const [themeSettingsData, setThemeSettingsData] = useState<themeSettingsFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [offset, setOffset] = useState<number>(0);
    const viewportRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);
    const [openedAddModal, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
    const [openedViewModal, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedDeleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [selectedTheme, setSelectedTheme] = useState<themeSettingsFields | null>(null);
    const [themeToDelete, setThemeToDelete] = useState<themeSettingsFields | null>(null);
    const { showNotification } = useNotification();

    const handleViewTheme = (theme: themeSettingsFields) => {
        setSelectedTheme(theme);
        openViewModal();
    };

    const handleEditTheme = (theme: themeSettingsFields) => {
        setSelectedTheme(theme);
        openEditModal();
    };

    const handleRequestDeleteTheme = (theme: themeSettingsFields) => {
        setThemeToDelete(theme);
        openDeleteModal();
    };

    const closeDeleteConfirmation = () => {
        setThemeToDelete(null);
        closeDeleteModal();
    };

    const handleConfirmDeleteTheme = async () => {
        const themeId = themeToDelete?.theme_id;

        if (!themeId) {
            closeDeleteConfirmation();
            return;
        }

        await handleDeleteTheme(themeId);
        closeDeleteConfirmation();
    };

    const handleDeleteTheme = async (theme_id: number) => {
        try {
            const res = await deleteTheme(theme_id);
            if (res.success) {
                showNotification("ลบธีมสำเร็จ!", "", "success");
                setThemeSettingsData((prev) => prev.filter((theme) => theme.theme_id !== theme_id));
            } else {
                showNotification("ลบธีมล้มเหลว!", res.message || "เกิดข้อผิดพลาด", "error");
            }
        } catch (error) {
            console.error("Delete theme failed:", error);
            showNotification("เกิดข้อผิดพลาด!", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "error");
        }
    };

    const fetchData = async (offset: number) => {
        setLoading(true);

        const themeData = await getTheme({
            offset: offset,
            sort_by: "theme_id",
            sort_order: "asc",
            limit: BATCH_SIZE,
            flag_valid: true,
        });

        console.log("Fetched theme settings data:", themeData);

        if (offset === 0) {
            setThemeSettingsData(themeData.data);
        } else {
            setThemeSettingsData((prev) => [...prev, ...themeData.data]);
        }

        if (themeData.data.length < BATCH_SIZE) {
            setHasMore(false);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchData(0);
        }
    }, []);

    const statusMap: Record<
        "pending" | "active" | "completed",
        { label: string; color: string }
    > = {
        pending: {
            label: "รอดำเนินการ",
            color: "#f59e0b",
        },
        active: {
            label: "กำลังใช้งาน",
            color: "#3b82f6",
        },
        completed: {
            label: "เสร็จสิ้น",
            color: "#22c55e",
        },
    };

    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = themeSettingsData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };

    const addThemeData = async (values: themeSettingsFields) => {
        try {
            const res = await createTheme({
                ...values,
                start_date: values.is_default
                    ? null
                    : normalizeDate(values.start_date as Date | undefined),
                end_date: values.is_default
                    ? null
                    : normalizeDate(values.end_date as Date | undefined),
                flag_valid: true,
            });

            if (res.success) {
                showNotification("เพิ่มธีมสำเร็จ!", "", "success");
                setThemeSettingsData([]);
                setHasMore(true);
                fetchData(0);
            } else {
                showNotification("เพิ่มธีมล้มเหลว!", res.message || "เกิดข้อผิดพลาด", "error");
            }
        } catch (error) {
            console.error("Create theme failed:", error);
            showNotification("เกิดข้อผิดพลาด!", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "error");
        }
    };

    const updateThemeData = async (values: themeSettingsFields) => {
        try {
            const res = await updateTheme({
                ...values,
                start_date: values.is_default
                    ? null
                    : normalizeDate(values.start_date as Date | undefined),
                end_date: values.is_default
                    ? null
                    : normalizeDate(values.end_date as Date | undefined),
            });

            if (res.success) {
                showNotification("แก้ไขธีมสำเร็จ!", "", "success");
                setThemeSettingsData([]);
                setHasMore(true);
                fetchData(0);
            } else {
                showNotification("แก้ไขธีมล้มเหลว!", res.message || "เกิดข้อผิดพลาด", "error");
            }
        } catch (error) {
            console.error("Update theme failed:", error);
            showNotification("เกิดข้อผิดพลาด!", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "error");
        }
    };

    const rows = themeSettingsData.map((theme) => {
        const rawStatus = (theme.status ?? "").toLowerCase();
        const themeStatus = (rawStatus in statusMap
            ? rawStatus
            : "pending") as keyof typeof statusMap;

        return (
        <Table.Tr key={theme.theme_id} className='text-xs'>
            <Table.Td ta="center">
                <Image
                    src={theme.theme_url}
                    h={40}
                    w={60}
                    radius="sm"
                    fallbackSrc="https://placehold.co/600x400?text=No+Image"
                    className="mx-auto"
                />
            </Table.Td>
            <Table.Td ta="center">{theme.theme_name}</Table.Td>
            <Table.Td ta="center">
                {theme.is_default || !theme.start_date ? '-' : formatDate(theme.start_date)}
            </Table.Td>
            <Table.Td ta="center">
                {theme.is_default || !theme.end_date ? '-' : formatDate(theme.end_date)}
            </Table.Td>
            <Table.Td ta="center">
                <div
                    className="px-2 rounded-sm text-black w-max mx-auto border"
                    style={{
                        borderColor: statusMap[themeStatus].color,
                        color: statusMap[themeStatus].color,
                    }}
                >
                    {statusMap[themeStatus].label}
                </div>
            </Table.Td>
            <Table.Td ta="center">
                <Group gap={5} justify="center" wrap="nowrap">
                    <Tooltip label="ดูรายละเอียด" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewTheme(theme);
                            }}
                        >
                            <IconEye size={20} stroke={2} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="แก้ไข" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditTheme(theme);
                            }}
                        >
                            <IconEdit size={20} stroke={2} color='#5e5e5eff' />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="ลบ" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRequestDeleteTheme(theme);
                            }}
                        >
                            <IconTrash size={20} stroke={2} color='#ef4444' />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    )});

    return (
        <div
            className='bg-white'
            style={{ padding: '1px' }}>

            <div className="flex justify-between items-center mb-3 mt-1">
                <Text size="xl" fw={500} className='flex items-center gap-2'>
                    ธีมทั้งหมด
                </Text>

                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        radius="md"
                        onClick={openAddModal}
                    >
                        เพิ่มธีม
                    </Button>
                </div>
            </div>

            <ScrollArea
                h={480}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            {/* <Table.Th w={5} ta="center">ลำดับ</Table.Th> */}
                            <Table.Th w={50} ta="center">รูปตัวอย่าง</Table.Th>
                            <Table.Th w={50} ta="center">ชื่อธีม</Table.Th>
                            <Table.Th w={40} ta="center">วันเริ่มต้น</Table.Th>
                            <Table.Th w={40} ta="center">วันสิ้นสุด</Table.Th>
                            <Table.Th w={40} ta="center">สถานะ</Table.Th>
                            <Table.Th w={5} ta="center">จัดการ</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>

                {loading && (
                    <Center p="md">
                        <Loader size="sm" />
                    </Center>
                )}

                {!hasMore && (
                    <Center p="md" mt="xs">
                        <Text size="sm" c="dimmed">ธีมทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {themeSettingsData.length} จาก {themeSettingsData[0]?.total_count} รายการ
            </Text>

            <AddThemeModal
                opened={openedAddModal}
                close={closeAddModal}
                onSubmit={async (values) => {
                    await addThemeData(values);
                    closeAddModal();
                }}
            />

            <EditThemeModal
                opened={openedEditModal}
                close={closeEditModal}
                theme={selectedTheme}
                onSubmit={async (values) => {
                    await updateThemeData(values);
                    closeEditModal();
                }}
            />

            <ViewThemeModal
                opened={openedViewModal}
                close={closeViewModal}
                theme={selectedTheme}
            />

            <ConfirmModalEx
                opened={openedDeleteModal}
                onClose={closeDeleteConfirmation}
                handleConfirm={handleConfirmDeleteTheme}
                title="ยืนยันการลบธีม"
                description={`คุณต้องการลบธีม${themeToDelete?.theme_name ? ` "${themeToDelete.theme_name}"` : "นี้"} ใช่หรือไม่?`}
                color="red"
            />
        </div>
    );
}

