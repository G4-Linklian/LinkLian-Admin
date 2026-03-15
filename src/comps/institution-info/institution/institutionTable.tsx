import { useState, useRef, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center,
    TextInput,
    ActionIcon,
    Tooltip
} from '@mantine/core';
import { IconSearch, IconFilter, IconEye, IconEdit } from '@tabler/icons-react';
import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useDebouncedValue } from "@mantine/hooks";
import { useNotification } from '@/comps/noti/notiComp';
import EditInstitutionModal from './EditInstitutionModal';
import ViewInstitutionModal from './ViewInstitutionModal';
import { getInstitution, updateInstitution } from '@/utils/api/institution';
import { institutionFields } from '@/utils/interface/institution.types';
import { mapInstitutionType } from '@/utils/function/institutionType';
import FilterInstModal from './FilterInstModal';

const BATCH_SIZE = 20;

export default function InstitutionTable() {
    const [institutionData, setInstitutionData] = useState<institutionFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);
    const [filterParams, setFilterParams] = useState<institutionFields>({});
    const { showNotification } = useNotification();

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedFilterModal, { open: openFilterModal, close: closeFilterModal }] = useDisclosure(false);
    const [openedViewModal, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    const [viewInstitution, setViewInstitution] = useState<institutionFields | null>(null);
    const [selectedInstitution, setSelectedInstitution] =
        useState<institutionFields | null>(null);

    const buildFiltersWithKeyword = (values: institutionFields) => ({
        ...values,
        keyword: debouncedSearchTerm,
    });

    const openEditModals = (institution: institutionFields) => {
        setSelectedInstitution(institution);
        openEditModal();
    };

    const openViewModals = (institution: institutionFields) => {
        setViewInstitution(institution);
        openViewModal();
    };

    const viewportRef = useRef<HTMLDivElement>(null);

    const initialized = useRef(false);

    const fetchData = async (offset: number) => {
        setLoading(true);

        const userData = await getInstitution({
            from: "admin",
            offset: offset,
            sort_by: "inst_id",
            sort_order: "asc",
            limit: BATCH_SIZE,
            ...filterParams
        });

        console.log("Fetched institution data:", userData);

        if (offset === 0) {
            setInstitutionData(userData.data);
        } else {
            setInstitutionData((prev) => [...prev, ...userData.data]);
        }

        if (userData.data.length < BATCH_SIZE) {
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

    useEffect(() => {
        if (!initialized.current) return;

        setFilterParams((prev) => ({
            ...prev,
            keyword: debouncedSearchTerm,
        }));
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (!initialized.current) return;

        setInstitutionData([]);
        setHasMore(true);
        fetchData(0);
    }, [filterParams]);

    const handleApplyFilter = (values: institutionFields) => {
        setFilterParams(buildFiltersWithKeyword(values));
    };

    const handleClearFilter = () => {
        setFilterParams(buildFiltersWithKeyword({}));
    };

    const updateInstitutionData = async (values: institutionFields) => {
        if (!selectedInstitution?.inst_id) {
            showNotification("แก้ไขสถาบันล้มเหลว!", "ไม่พบสถาบันที่เกี่ยวข้อง", "error");
            return;
        }

        try {
            const payload = {
                ...values,
                inst_id: Number(selectedInstitution.inst_id),
            };

            const res = await updateInstitution(payload);

            setInstitutionData([]);
            setHasMore(true);
            await fetchData(0);

            if (res.success) {
                showNotification("แก้ไขสถาบันสำเร็จ!", "", "success");
                closeEditModal();
            } else {
                showNotification("แก้ไขสถาบันล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Edit institution failed:", error);
            showNotification("แก้ไขสถาบันล้มเหลว!", "An error occurred while editing the institution.", "error");
        }
    };

    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = institutionData.length;
                    fetchData(nextOffset);
                }
            }
        }
    };

    const statusMap: Record<string, { label: string; color: string }> = {
        approved: {
            label: "อนุมัติ",
            color: "#11bd2eff", // green-400
        },
        rejected: {
            label: "ปฏิเสธ",
            color: "#fb7185", // red-400
        },
    };

    const rows = institutionData.map((element) => (
        <Table.Tr
            key={element.inst_id}
            className='text-xs'
        >
            <Table.Td ta="center">{element.inst_email}</Table.Td>
            <Table.Td ta="center">{element.inst_name_th}</Table.Td>
            <Table.Td ta="center">{element.inst_abbr_th}</Table.Td>
            <Table.Td ta="center">{mapInstitutionType(element.inst_type)}</Table.Td>
            <Table.Td ta="center">{element.province}</Table.Td>
            <Table.Td ta="center">
                {(() => {
                    const statusKey = (element.approve_status || "pending").toLowerCase();
                    const status = statusMap[statusKey] || statusMap.pending;

                    return (
                <div
                    className="px-2 rounded-sm text-black w-max mx-auto border"
                    style={{
                        borderColor: status.color,
                        color: status.color,
                    }}
                >
                    {status.label}
                </div>
                    );
                })()}
            </Table.Td>

            <Table.Td ta="center">
                <Group gap={5} justify="center" wrap="nowrap">
                    {/* View */}
                    <Tooltip label="ดูรายละเอียด" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                openViewModals(element);
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
                                openEditModals(element);
                            }}
                        >
                            <IconEdit size={20} stroke={2} color='#5e5e5eff'/>
                        </ActionIcon>
                    </Tooltip>

                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <div
            className='bg-white'
            style={{ padding: '1px' }}>

            <div className="flex justify-between items-center mb-3 mt-1">
                {/* ส่วนหัวข้อ */}
                <Text size="xl" fw={500} className='flex items-center gap-2'>
                    รายชื่อสถาบันในระบบ
                </Text>

                <div className="flex items-center gap-2">
                    <TextInput
                        placeholder="ค้นหา..."
                        size="xs"
                        radius="md"
                        leftSection={<IconSearch size={14} />}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                    />

                    <Button
                        variant="default"
                        size="xs"
                        radius="md"
                        leftSection={<IconFilter size={14} />}
                        onClick={openFilterModal}
                    >
                        ตัวกรอง
                    </Button>

                </div>
            </div>

            <ScrollArea
                h={650}
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
                            <Table.Th w={70} ta="center">อีเมล</Table.Th>
                            <Table.Th w={60} ta="center">ชื่อสถาบัน</Table.Th>
                            <Table.Th w={30} ta="center">อักษรย่อ</Table.Th>
                            <Table.Th w={30} ta="center">ประเภท</Table.Th>
                            <Table.Th w={30} ta="center">จังหวัด</Table.Th>
                            <Table.Th w={30} ta="center">สถานะ</Table.Th>
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
                        <Text size="sm" c="dimmed">สถาบันทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {institutionData.length} จาก {institutionData[0]?.total_count} รายการ
            </Text>

            <EditInstitutionModal
                institution={selectedInstitution}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateInstitutionData(values);
                }}
            />

            <ViewInstitutionModal
                institution={viewInstitution}
                opened={openedViewModal}
                close={closeViewModal}
            />

            <FilterInstModal
                opened={openedFilterModal}
                close={closeFilterModal}
                onSubmit={handleApplyFilter}
                onClear={handleClearFilter}
                initialValues={filterParams}
            />
        </div>
    );
}