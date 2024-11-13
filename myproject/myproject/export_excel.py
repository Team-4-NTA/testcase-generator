import openai
import openpyxl

openai.api_key = ''

def get_login_test_case():
    prompt = (
        "Tạo test case cho màn hình login bao gồm các mục sau: "
        "STT, Độ ưu tiên, Loại, Mục tiêu, Dữ liệu kiểm tra, "
        "Điều kiện, Các bước kiểm tra, Kết quả mong đợi, Ghi chú,"
        "nhưng không ghi tiêu đề các mục vào sheet."
    )
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300
    )

    return response['choices'][0]['message']['content'].strip()

def write_test_case_to_excel(test_case_text, excel_file_path, output_file_path):
    workbook = openpyxl.load_workbook(excel_file_path)
    sheet = workbook.active

    test_cases = test_case_text.split("\n")

    row = 9
    for case in test_cases:
        columns = case.split(" | ")

        if len(columns) >= 9:
            sheet[f"A{row}"] = columns[0]  # STT
            sheet[f"B{row}"] = columns[1]  # Độ ưu tiên
            sheet[f"C{row}"] = columns[2]  # Loại
            sheet[f"D{row}"] = columns[3]  # Mục tiêu
            sheet[f"E{row}"] = columns[4]  # Dữ liệu kiểm tra
            sheet[f"F{row}"] = columns[5]  # Điều kiện
            sheet[f"G{row}"] = columns[6]  # Các bước kiểm tra
            sheet[f"H{row}"] = columns[7]  # Kết quả mong đợi
            sheet[f"I{row}"] = columns[8]  # Ghi chú
            row += 1

    workbook.save(output_file_path)
    print(f"Test cases đã được ghi vào {output_file_path}")

excel_file_path = "D:/AI/testcase/format/login_screen.xlsx"
output_file_path = "D:/AI/testcase/result/login_screen.xlsx"

test_case_text = get_login_test_case()
write_test_case_to_excel(test_case_text, excel_file_path, output_file_path)
