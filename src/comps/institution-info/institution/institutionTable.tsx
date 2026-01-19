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
import { PushRouter } from '@/utils/function/navigation';
import { useNotification } from '@/comps/noti/notiComp';
import { useEduLevelOptions } from "@/hooks/eduLevel";
import { updateProgramUserSys } from '@/utils/api/program';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
// import EditInstitutionModal from './EditInstitutionModal';
import AddInstitutionModal from './AddInstitutionModal';
import ViewInstitutionModal from './ViewInstitutionModal';
import { getInstitution, updateInstitution } from '@/utils/api/institution';
import { institutionFields } from '@/utils/interface/institution.types';

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
    const { showNotification } = useNotification();
    const { options: eduLevelOptions, isLoading: eduLevelLoading } = useEduLevelOptions();

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddInstitution, { open: openAddInstitution, close: closeAddInstitution }] = useDisclosure(false);
    const [openedConfirmReject, { open: openConfirmReject, close: closeConfirmReject }] = useDisclosure(false);
    const [openedViewModal, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    const [viewInstitution, setViewInstitution] = useState<institutionFields | null>(null);
    const [selectedInstitution, setSelectedInstitution] =
        useState<institutionFields | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);

    const openEditModals = (institution: institutionFields) => {
        setSelectedInstitution(institution);
        openEditModal();
    };

    const openAddInstitutionModal = () => {
        openAddInstitution();
    };

    const openViewModals = (institution: institutionFields) => {
        setViewInstitution(institution);
        openViewModal();
    };

    const viewportRef = useRef<HTMLDivElement>(null);

    const initialized = useRef(false);

    const executeUpdate = async (id: number, status: "approve" | "reject") => {
        try {
            const res = await updateInstitution({
                inst_id: id,
                approve_status: status
            });

            if (res.success) {
                showNotification(
                    status === "approve" ? "อนุมัติสำเร็จ" : "ปฏิเสธสำเร็จ",
                    `ดำเนินการ${status === "approve" ? "อนุมัติ" : "ปฏิเสธ"}สถาบันเรียบร้อยแล้ว`,
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
            closeConfirmReject();
        }
    };

    const handleApproveStatus = (
        instId: number,
        status: "approve" | "reject"
    ) => {
        if (status === "reject") {
            setRejectId(instId);
            openConfirmReject();
        } else {
            executeUpdate(instId, status);
        }
    };


    const fetchData = async (offset: number) => {
        setLoading(true);

        const userData = await getInstitution({
            // approve_status: "pending",
            from: "admin",
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

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchData(0);
        }
    }, []);

    // const addInstitutionData = async (values: institutionFields) => {
    //     if (!instId) {
    //         showNotification("เพิ่มสถาบันล้มเหลว!", "ไม่พบสถาบันที่เกี่ยวข้อง", "error");
    //         return;
    //     }
    //     try {
    //         const res = await createUserSys({
    //             ...values,
    //             inst_id: Number(instId),
    //             role_id: Number(roleID),
    //             learning_area_id: Number(values.learning_area_id),
    //             edu_lev_id: Number(values.edu_lev_id),
    //         });

    //         setInstitutionData([]);
    //         setHasMore(true);
    //         fetchData(0);

    //         if (res.success) {
    //             showNotification("เพิ่มสถาบันสำเร็จ!", "", "success");
    //         } else {
    //             showNotification("เพิ่มสถาบันล้มเหลว!", res.message, "error");
    //         }
    //     } catch (error) {
    //         console.error("Create institution failed:", error);
    //         showNotification("เพิ่มสถาบันล้มเหลว!", "An error occurred while creating the institution.", "error");
    //     }
    // };

    const updateInstitutionData = async (values: institutionFields) => {
        if (!instId) {
            showNotification("แก้ไขสถาบันล้มเหลว!", "ไม่พบสถาบันที่เกี่ยวข้อง", "error");
            return;
        }

        try {

            const payload = {
                ...values,
                inst_id: Number(instId),
            };


            const res = await updateInstitution(payload);

            setInstitutionData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขสถาบันสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขสถาบันล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Edit institution failed:", error);
            showNotification("แก้ไขสถาบันล้มเหลว!", "An error occurred while editing the institution.", "error");
        }
    };


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
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };

    const statusMap: Record<
        "pending" | "approved" | "reject",
        { label: string; color: string }
    > = {
        approved: {
            label: "อนุมัติ",
            color: "#11bd2eff", // green-400
        },
        reject: {
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
            <Table.Td ta="center">{element.inst_type}</Table.Td>
            <Table.Td ta="center">{element.province}</Table.Td>
            <Table.Td ta="center">
                <div
                    className="px-2 rounded-sm text-black w-max mx-auto border"
                    style={{
                        borderColor: statusMap[element.approve_status as "pending" | "approved" | "reject"]?.color ?? "#9ca3af",
                        color: statusMap[element.approve_status as "pending" | "approved" | "reject"]?.color ?? "#9ca3af",
                    }}
                >
                    {statusMap[element.approve_status as "pending" | "approved" | "reject"]?.label ?? "ไม่ทราบสถานะ"}
                </div>
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
                    รายชื่อสถาบัน
                </Text>

                <div className="flex items-center gap-2">
                    <TextInput
                        placeholder="ค้นหา..."
                        size="xs"
                        radius="md"
                        leftSection={<IconSearch size={14} />}
                    // onChange={(event) => handleSearch(event.currentTarget.value)} 
                    />


                    <Button
                        variant="default"
                        size="xs"
                        radius="md"
                        leftSection={<IconFilter size={14} />}
                        onClick={() => {
                            // logic เปิด Modal หรือ Dropdown filter
                        }}
                    >
                        ตัวกรอง
                    </Button>

                    <Button
                        size="xs"
                        radius="md"
                        // leftSection={<IconPlus size={14} />}
                        onClick={() => {
                            openAddInstitutionModal();
                        }}
                    >
                        เพิ่มสถาบัน
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

            {/* <EditInstitutionModal
                institution={selectedInstitution}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateInstitutionData(values);
                    //console.log("Edit institution values:", values);
                    closeEditModal();
                }}
                eduLevelOptions={eduLevelOptions}
                token={token}
            /> */}

            {/* <AddInstitutionModal
                opened={openedAddInstitution}
                close={closeAddInstitution}
                onSubmit={async (values) => {
                    await addInstitutionData(values);
                    // console.log("Add institution values:", values);
                    closeAddInstitution();
                }}
                eduLevelOptions={eduLevelOptions}
                token={token}
            /> */}
            <ConfirmModalEx
                opened={openedConfirmReject}
                onClose={closeConfirmReject}
                title="ยืนยันการปฏิเสธ"
                description="คุณต้องการปฏิเสธสถาบันนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
                handleConfirm={() => rejectId && executeUpdate(rejectId, "reject")}
                color="red"
            />

            <ViewInstitutionModal
                institution={viewInstitution}
                opened={openedViewModal}
                close={closeViewModal}
            />
        </div>
    );
}