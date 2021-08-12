/**
 * có thể có nhiều bản ghi trùng ma_lop, khác buoi_hoc_so
 * index là buoi_hoc_so và ma_lop
 */
export class LopDangKy {
    ma_lop: number;
    ma_lop_kem: number;
    loai_lop: string;
    ma_hoc_phan: string;
    ten_hoc_phan: string;

    buoi_hoc_so: number;
    thu_hoc: string;
    thoi_gian_hoc: string;
    phong_hoc: string;
    tuan_hoc: string;
    ghi_chu: string;

    _timestamp: number; // meta data
}
