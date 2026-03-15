import {
    Modal,
    Button,
    Group,
    TextInput,
    Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { institutionFields } from "@/utils/interface/institution.types";
import { useEffect } from "react";
import { IconFilter } from "@tabler/icons-react";

interface FilterInstModalProps {
    opened: boolean;
    close: () => void;
    onSubmit: (values: institutionFields) => void;
    onClear: () => void;
    initialValues: institutionFields;
}

export default function FilterInstModal({
    opened,
    close,
    onSubmit,
    onClear,
    initialValues,
}: FilterInstModalProps) {
    const institutionTypeOptions = [
        { value: "school", label: "โรงเรียน" },
        { value: "uni", label: "มหาวิทยาลัย" },
    ];

    const statusOptions = [
        { value: "approved", label: "อนุมัติ" },
        { value: "rejected", label: "ปฏิเสธ" },
    ];

    const form = useForm<institutionFields>({
        initialValues: {
            inst_type: "",
            province: "",
            approve_status: "",
        },
    });

    useEffect(() => {
        if (opened) {
            form.setValues(initialValues);
        }
    }, [opened, initialValues]);

    const handleSubmit = (values: institutionFields) => {
        const filteredValues: institutionFields = {};

        const hasValue = (val: string | number | null | undefined) =>
            val !== "" && val !== undefined && val !== null;

        if (hasValue(values.inst_type)) filteredValues.inst_type = values.inst_type;
        if (hasValue(values.province)) filteredValues.province = values.province;
        if (hasValue(values.approve_status)) filteredValues.approve_status = values.approve_status;
        onSubmit(filteredValues);
        close();
    };

    const handleClear = () => {
        form.reset();
        onClear();
        close();
    };

    return (
        <Modal
            id="filter-institution-modal"
            opened={opened}
            onClose={close}
            centered
            size="md"
            radius={16}
        >
            <h1 className="color-black font-bold text-2xl mb-4 text-center">ตัวกรองสถาบัน</h1>
            <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="filter-institution-form">
                <Select
                    label="ประเภท"
                    placeholder="เลือกประเภทสถาบัน"
                    data={institutionTypeOptions}
                    {...form.getInputProps("inst_type")}
                    radius={8}
                    clearable
                />

                <TextInput
                    label="จังหวัด"
                    placeholder="กรอกจังหวัด"
                    {...form.getInputProps("province")}
                    radius={8}
                />

                <Select
                    label="สถานะ"
                    placeholder="เลือกสถานะ"
                    data={statusOptions}
                    {...form.getInputProps("approve_status")}
                    radius={8}
                    clearable
                />

                <Group justify="right" mt="lg">
                    <Button
                        variant="default"
                        onClick={handleClear}
                        radius={8}
                    >
                        ล้างค่า
                    </Button>
                    <Button
                        type="submit"
                        radius={8}
                        leftSection={<IconFilter size={16} />}
                    >
                        ค้นหา
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
