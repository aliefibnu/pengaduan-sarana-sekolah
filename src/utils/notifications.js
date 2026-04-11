import { Confirm, Loading, Notify, Report } from "notiflix";

Notify.init({
  position: "right-top",
  timeout: 2500,
  clickToClose: true,
});

Loading.init({
  svgColor: "#1d4ed8",
  backgroundColor: "rgba(15, 23, 42, 0.55)",
  clickToClose: false,
});

export function showSuccess(message) {
  Notify.success(message);
}

export function showError(message = "Terjadi kesalahan. Coba lagi.") {
  Report.failure("Error", message, "Tutup");
}

export function showInfo(message) {
  Notify.info(message);
}

export function openLoading(message = "Memproses data...") {
  Loading.standard(message);
}

export function closeLoading() {
  Loading.remove();
}

export function confirmAction({
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  okText = "Ya",
  cancelText = "Batal",
}) {
  return new Promise((resolve) => {
    Confirm.show(
      title,
      message,
      okText,
      cancelText,
      () => resolve(true),
      () => resolve(false),
    );
  });
}
