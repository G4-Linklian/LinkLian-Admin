import { useEffect, useRef, useState } from 'react';
import {
	Badge,
	Center,
	Group,
	Loader,
	ScrollArea,
	Table,
	Text,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { decodeRegistrationToken } from '@/utils/authToken';
import { formatDateTime } from '@/config/formatters';
import { getAdminReport } from '@/utils/api/report';
import { useNotification } from '@/comps/noti/notiComp';
import ReportDetailModal from './reportDetailModal';
import { ReportRow } from './types';
import { getInstTypeTH } from '@/enums/instType';

const BATCH_SIZE = 20;

interface ReportResolvedTableProps {
	searchTerm?: string;
	refreshKey?: number;
}

export default function ReportResolvedTable({ searchTerm = '', refreshKey = 0 }: ReportResolvedTableProps) {
	const [reportData, setReportData] = useState<ReportRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
	const [openedDetail, { open: openDetail, close: closeDetail }] = useDisclosure(false);
	const viewportRef = useRef<HTMLDivElement>(null);
	const { showNotification } = useNotification();


	const fetchData = async (offset: number) => {

		setLoading(true);
		try {
			const response = await getAdminReport({
				mark_resolved: true,
				offset,
				limit: BATCH_SIZE,
			});

			const rows: ReportRow[] = response?.data ?? [];

			if (offset === 0) {
				setReportData(rows);
			} else {
				setReportData((prev) => [...prev, ...rows]);
			}

			if (rows.length < BATCH_SIZE) {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Fetch resolved reports failed:', error);
			showNotification('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงรายการแจ้งปัญหาได้', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setReportData([]);
		setHasMore(true);
		fetchData(0);
	}, [refreshKey]);

	const onScroll = () => {
		if (!viewportRef.current) return;

		const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;
		if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
			fetchData(reportData.length);
		}
	};

	const normalizedSearch = searchTerm.trim().toLowerCase();

	const filteredData = normalizedSearch
		? reportData.filter((item) => {
			const title = (item.title || '').toLowerCase();
			const detail = (item.detail || '').toLowerCase();
			const instName = (item.inst_name_th || '').toLowerCase();

			return title.includes(normalizedSearch) || detail.includes(normalizedSearch) || instName.includes(normalizedSearch);
		})
		: reportData;

	const rows = filteredData.map((item) => (
		<Table.Tr key={item.admin_report_id} className="text-xs">
			<Table.Td ta="center">{item.title || '-'}</Table.Td>
			<Table.Td ta="center">{item.inst_name_th || '-'}</Table.Td>
			<Table.Td ta="center">{getInstTypeTH(item.inst_type) || '-'}</Table.Td>
			<Table.Td ta="center">{formatDateTime(item.report_date)}</Table.Td>
			<Table.Td ta="center">
				<Badge color="green" variant="light">แก้ไขแล้ว</Badge>
			</Table.Td>
			<Table.Td ta="center">
				<Group justify="center" gap="xs">
					<IconEye
						size={18}
						stroke={2}
						color="gray"
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setSelectedReport(item);
							openDetail();
						}}
					/>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<div>
			<ScrollArea
				h={600}
				onScrollPositionChange={onScroll}
				viewportRef={viewportRef}
				type="always"
				bd="1px solid gray.3"
				style={{ borderRadius: 8 }}
			>
				<Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed">
					<Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
						<Table.Tr>
							<Table.Th w={50} ta="center">หัวข้อ</Table.Th>
							<Table.Th w={50} ta="center">สถานบันที่แจ้ง</Table.Th>
							<Table.Th w={50} ta="center">ประเภทสถาบัน</Table.Th>
							{/* <Table.Th w={70} ta="center">รายละเอียด</Table.Th> */}
							<Table.Th w={35} ta="center">วันที่แจ้ง</Table.Th>
							<Table.Th w={25} ta="center">สถานะ</Table.Th>
							<Table.Th w={30} ta="center">จัดการ</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.length > 0 ? (
							rows
						) : (
							<Table.Tr>
								<Table.Td colSpan={6}>
									<Center py="md">
										<Text c="dimmed" size="sm">
											{normalizedSearch ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีรายการแจ้งปัญหาที่แก้ไขแล้ว'}
										</Text>
									</Center>
								</Table.Td>
							</Table.Tr>
						)}
					</Table.Tbody>
				</Table>

				{loading && (
					<Center p="md">
						<Loader size="sm" />
					</Center>
				)}
			</ScrollArea>

			<ReportDetailModal
				opened={openedDetail}
				onClose={closeDetail}
				report={selectedReport}
			/>
		</div>
	);
}
