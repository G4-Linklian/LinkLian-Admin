import { useEffect } from "react";
import { Button, Grid, Group, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { institutionFields } from "@/utils/interface/institution.types";

interface EditInstitutionModalProps {
	institution: institutionFields | null;
	opened: boolean;
	close: () => void;
	onSubmit: (values: institutionFields) => Promise<void> | void;
}

const institutionTypeOptions = [
	{ value: "school", label: "โรงเรียน" },
	{ value: "uni", label: "มหาวิทยาลัย" },
];

const statusOptions = [
	{ value: "approved", label: "อนุมัติ" },
	{ value: "rejected", label: "ปฏิเสธ" },
	{ value: "pending", label: "รอการอนุมัติ" },
];

export default function EditInstitutionModal({
	institution,
	opened,
	close,
	onSubmit,
}: EditInstitutionModalProps) {
	const form = useForm<institutionFields>({
		initialValues: {
			inst_email: "",
			inst_name_th: "",
			inst_name_en: "",
			inst_abbr_th: "",
			inst_abbr_en: "",
			inst_type: "",
			inst_phone: "",
			website: "",
			address: "",
			subdistrict: "",
			district: "",
			province: "",
			postal_code: "",
			logo_url: "",
			docs_url: "",
			approve_status: "",
		},
		validate: {
			inst_email: (value) => {
				if (!value) return "กรุณากรอกอีเมล";
				if (!/^\S+@\S+$/.test(value)) return "รูปแบบอีเมลไม่ถูกต้อง";
				return null;
			},
			inst_name_th: (value) => (!value ? "กรุณากรอกชื่อสถาบัน (ไทย)" : null),
			inst_type: (value) => (!value ? "กรุณาเลือกประเภทสถาบัน" : null),
		},
	});

	useEffect(() => {
		if (!opened) return;

		form.setValues({
			inst_email: institution?.inst_email ?? "",
			inst_name_th: institution?.inst_name_th ?? "",
			inst_name_en: institution?.inst_name_en ?? "",
			inst_abbr_th: institution?.inst_abbr_th ?? "",
			inst_abbr_en: institution?.inst_abbr_en ?? "",
			inst_type: institution?.inst_type ?? "",
			inst_phone: institution?.inst_phone ?? "",
			website: institution?.website ?? "",
			address: institution?.address ?? "",
			subdistrict: institution?.subdistrict ?? "",
			district: institution?.district ?? "",
			province: institution?.province ?? "",
			postal_code: institution?.postal_code ?? "",
			logo_url: institution?.logo_url ?? "",
			docs_url: institution?.docs_url ?? "",
			approve_status: institution?.approve_status === "reject"
				? "rejected"
				: institution?.approve_status ?? "",
		});
		form.resetDirty();
	}, [opened, institution]);

	const handleSubmit = async (values: institutionFields) => {
		await onSubmit(values);
	};

	return (
		<Modal
			id="edit-institution-modal"
			opened={opened}
			onClose={close}
			centered
			size="lg"
			radius={16}
		>
			<h1 className="text-center text-2xl font-bold text-black mb-4">แก้ไขข้อมูลสถาบัน</h1>
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className="flex flex-col gap-3"
				id="edit-institution-form"
			>
				<Grid>
					<Grid.Col span={6}>
						<TextInput
							label="อีเมล"
							placeholder="กรอกอีเมล"
							{...form.getInputProps("inst_email")}
							radius={8}
							withAsterisk
                            required
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label="เบอร์โทรศัพท์"
							placeholder="กรอกเบอร์โทรศัพท์"
							{...form.getInputProps("inst_phone")}
							radius={8}
                            required
						/>
					</Grid.Col>

					<Grid.Col span={6}>
						<TextInput
							label="ชื่อสถาบัน (ไทย)"
							placeholder="กรอกชื่อสถาบันภาษาไทย"
							{...form.getInputProps("inst_name_th")}
							radius={8}
							withAsterisk
                            required
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label="ชื่อสถาบัน (อังกฤษ)"
							placeholder="กรอกชื่อสถาบันภาษาอังกฤษ"
							{...form.getInputProps("inst_name_en")}
							radius={8}
						/>
					</Grid.Col>

					<Grid.Col span={6}>
						<TextInput
							label="อักษรย่อ (ไทย)"
							placeholder="กรอกอักษรย่อภาษาไทย"
							{...form.getInputProps("inst_abbr_th")}
							radius={8}
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label="อักษรย่อ (อังกฤษ)"
							placeholder="กรอกอักษรย่อภาษาอังกฤษ"
							{...form.getInputProps("inst_abbr_en")}
							radius={8}
						/>
					</Grid.Col>

					<Grid.Col span={6}>
						<Select
							label="ประเภทสถาบัน"
							placeholder="เลือกประเภทสถาบัน"
							data={institutionTypeOptions}
							{...form.getInputProps("inst_type")}
							radius={8}
							withAsterisk
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<Select
							label="สถานะ"
							placeholder="เลือกสถานะ"
							data={statusOptions}
							{...form.getInputProps("approve_status")}
							radius={8}
							clearable
                            required
						/>
					</Grid.Col>

					<Grid.Col span={12}>
						<TextInput
							label="เว็บไซต์"
							placeholder="https://example.com"
							{...form.getInputProps("website")}
							radius={8}
						/>
					</Grid.Col>

					<Grid.Col span={12}>
						<TextInput
							label="ที่อยู่"
							placeholder="กรอกที่อยู่"
							{...form.getInputProps("address")}
							radius={8}
                            required
						/>
					</Grid.Col>

					<Grid.Col span={6}>
						<TextInput
							label="ตำบล/แขวง"
							placeholder="กรอกตำบล/แขวง"
							{...form.getInputProps("subdistrict")}
							radius={8}
                            required
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label="อำเภอ/เขต"
							placeholder="กรอกอำเภอ/เขต"
							{...form.getInputProps("district")}
							radius={8}
                            required
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label="จังหวัด"
							placeholder="กรอกจังหวัด"
							{...form.getInputProps("province")}
							radius={8}
                            required
						/>
					</Grid.Col>

					<Grid.Col span={6}>
						<TextInput
							label="รหัสไปรษณีย์"
							placeholder="กรอกรหัสไปรษณีย์"
							{...form.getInputProps("postal_code")}
							radius={8}
                            required
						/>
					</Grid.Col>
					<Grid.Col span={12}>
						<TextInput
							label="ลิงก์โลโก้"
							placeholder="วางลิงก์โลโก้"
							{...form.getInputProps("logo_url")}
							radius={8}
                            required
						/>
					</Grid.Col>

					<Grid.Col span={12}>
						<TextInput
							label="ลิงก์เอกสาร"
							placeholder="วางลิงก์เอกสาร"
							{...form.getInputProps("docs_url")}
							radius={8}
                            required
						/>
					</Grid.Col>
				</Grid>

				<Group justify="flex-end" mt="lg">
					<Button variant="outline" color="blue" onClick={close} radius={8}>
						ยกเลิก
					</Button>
					<Button type="submit" radius={8}>
						บันทึก
					</Button>
				</Group>
			</form>
		</Modal>
	);
}
