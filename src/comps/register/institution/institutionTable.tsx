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
import { IconSearch, IconFilter, IconPlus, IconEye, IconCheck, IconX } from '@tabler/icons-react';
import {
    IconEdit,
} from "@tabler/icons-react";

import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useDebouncedValue } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { useNotification } from '@/comps/noti/notiComp';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { getInstitution, updateInstitution } from '@/utils/api/institution';
import { institutionFields } from '@/utils/interface/institution.types';
import { mapInstitutionType } from '@/utils/function/institutionType';
import FilterInstModal from './FilterInstModal';
import ViewInstitutionModal from './ViewInstitutionModal';


const BATCH_SIZE = 20;

export default function InstitutionTable() {
    const [institutionData, setInstitutionData] = useState<institutionFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [roleID, setRoleID] = useState<number>(5);
    const [offset, setOffset] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);
    const { showNotification } = useNotification();
    const [viewInstitution, setViewInstitution] = useState<institutionFields | null>(null);

    const [openedFilterModal, { open: openFilterModal, close: closeFilterModal }] = useDisclosure(false);
    const [openedConfirmApprove, { open: openConfirmApprove, close: closeConfirmApprove }] = useDisclosure(false);
    const [openedConfirmReject, { open: openConfirmReject, close: closeConfirmReject }] = useDisclosure(false);
    const [selectedInstitution, setSelectedInstitution] =
        useState<institutionFields | null>(null);
    const [approveId, setApproveId] = useState<number | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [openedViewModal, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    const [filters, setFilters] = useState<institutionFields>({});

    const viewportRef = useRef<HTMLDivElement>(null);

    const initialized = useRef(false);

    const openViewModals = (institution: institutionFields) => {
        setViewInstitution(institution);
        openViewModal();
    };

    const executeUpdate = async (id: number, status: "approved" | "rejected") => {
        try {
            const res = await updateInstitution({
                inst_id: id,
                approve_status: status
            });

            if (res.success) {
                showNotification(
                    status === "approved" ? "อนุมัติสำเร็จ" : "ปฏิเสธสำเร็จ",
                    `ดำเนินการ${status === "approved" ? "อนุมัติ" : "ปฏิเสธ"}สถาบันเรียบร้อยแล้ว`,
                    "success"
                );
                // Remove from list
                setInstitutionData(prev => prev.filter(item => Number(item.inst_id) !== id));
            } else {
                showNotification("ดำเนินการล้มเหลว", res.message || "เกิดข้อผิดพลาด", "error");
            }
        } catch (error) {
            console.error("Update status failed:", error);
            showNotification("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "error");
        } finally {
            setApproveId(null);
            setRejectId(null);
            closeConfirmApprove();
            closeConfirmReject();
        }
    };

    const handleApproveStatus = (
        instId: number,
        status: "approved" | "rejected"
    ) => {
        if (status === "rejected") {
            setRejectId(instId);
            openConfirmReject();
        } else {
            setApproveId(instId);
            openConfirmApprove();
        }
    };


    const fetchData = async (offset: number, activeFilters: institutionFields = filters) => {
        setLoading(true);

        const requestFilters: institutionFields = {
            ...activeFilters,
            keyword: debouncedSearchTerm || undefined,
        };

        const userData = await getInstitution({
            approve_status: "pending",
            ...requestFilters,
            offset: offset,
            sort_by: "inst_id",
            sort_order: "asc",
            limit: BATCH_SIZE
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

    const handleApplyFilter = async (values: institutionFields) => {
        setFilters(values);
        setInstitutionData([]);
        setHasMore(true);
        setOffset(0);
        await fetchData(0, values);
    };

    const handleClearFilter = async () => {
        const clearedFilters: institutionFields = {};
        setFilters(clearedFilters);
        setInstitutionData([]);
        setHasMore(true);
        setOffset(0);
        await fetchData(0, clearedFilters);
    };

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchData(0);
        }
    }, []);

    useEffect(() => {
        if (!initialized.current) return;

        setInstitutionData([]);
        setHasMore(true);
        setOffset(0);
        fetchData(0);
    }, [debouncedSearchTerm]);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await updateInstitution({
                inst_id: id,
                approve_status: status
            });

            if (res.success) {
                showNotification("ดำเนินการสำเร็จ!", "", "success");
                setInstitutionData([]);
                setHasMore(true);
                fetchData(0);
            } else {
                showNotification("ดำเนินการล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Update status failed:", error);
            showNotification("เกิดข้อผิดพลาด!", "An error occurred.", "error");
        }
    };

    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = institutionData.length;
                    fetchData(nextOffset, filters);
                    setOffset(nextOffset);
                }
            }
        }
    };

    const statusMap: Record<
        "pending" | "approved" | "rejected",
        { label: string; color: string }
    > = {
        approved: {
            label: "อนุมัติ",
            color: "#11bd2eff", // green-400
        },
        rejected: {
            label: "ปฏิเสธ",
            color: "#fb7185", // red-400
        },
        pending: {
            label: "รอการอนุมัติ",
            color: "rgb(255, 205, 43)", // blue-400
        },
    };

    const rows = institutionData.map((element, index) => (
        <Table.Tr
            key={element.inst_id}
            className='text-xs'
        >
            <Table.Td ta="center">{element.inst_email}</Table.Td>
            <Table.Td ta="center">{element.inst_name_th}</Table.Td>
            <Table.Td ta="center">{element.inst_abbr_th}</Table.Td>
            <Table.Td ta="center">{mapInstitutionType(element.inst_type)}</Table.Td>
            <Table.Td ta="center">{element.province}</Table.Td>
            {/* <Table.Td ta="center">
                <div
                    className="px-2 rounded-sm text-black w-max mx-auto border"
                    style={{
                        borderColor: statusMap[(element.approve_status === 'approved' || element.approve_status === 'reject' ? element.approve_status : 'pending') as "pending" | "approved" | "reject"]?.color ?? "#9ca3af",
                        color: statusMap[(element.approve_status === 'approved' || element.approve_status === 'reject' ? element.approve_status : 'pending') as "pending" | "approved" | "reject"]?.color ?? "#9ca3af",
                    }}
                >
                    {statusMap[(element.approve_status === 'approved' || element.approve_status === 'reject' ? element.approve_status : 'pending') as "pending" | "approved" | "reject"]?.label ?? "ไม่ทราบสถานะ"}
                </div>
            </Table.Td> */}

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

                    {/* Reject */}
                    <Tooltip label="ปฏิเสธ" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() =>
                                handleApproveStatus(Number(element.inst_id), "rejected")
                            }
                        >
                            <IconX size={20} stroke={2} />
                        </ActionIcon>
                    </Tooltip>

                    {/* Approve */}
                    <Tooltip label="อนุมัติ" withArrow>
                        <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() =>
                                handleApproveStatus(Number(element.inst_id), "approved")
                            }
                        >
                            <IconCheck size={20} stroke={2} />
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
                    รายชื่อสถาบันที่รอการอนุมัติ
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
                            <Table.Th w={60} ta="center">อีเมล</Table.Th>
                            <Table.Th w={70} ta="center">ชื่อสถาบัน</Table.Th>
                            <Table.Th w={30} ta="center">อักษรย่อ</Table.Th>
                            <Table.Th w={30} ta="center">ประเภท</Table.Th>
                            <Table.Th w={50} ta="center">จังหวัด</Table.Th>
                            <Table.Th w={20} ta="center">จัดการ</Table.Th>
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

            <ConfirmModalEx
                opened={openedConfirmApprove}
                onClose={() => {
                    setApproveId(null);
                    closeConfirmApprove();
                }}
                title="ยืนยันการอนุมัติ"
                description="คุณต้องการอนุมัติสถาบันนี้ใช่หรือไม่?"
                handleConfirm={() => approveId && executeUpdate(approveId, "approved")}
                color="green"
            />

            <ConfirmModalEx
                opened={openedConfirmReject}
                onClose={() => {
                    setRejectId(null);
                    closeConfirmReject();
                }}
                title="ยืนยันการปฏิเสธ"
                description="คุณต้องการปฏิเสธสถาบันนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
                handleConfirm={() => rejectId && executeUpdate(rejectId, "rejected")}
                color="red"
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
                initialValues={filters}
            />
        </div>
    );
}