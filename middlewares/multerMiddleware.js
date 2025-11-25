import multer from "multer";

import path from "path";

const storage = multer.diskStorage({
	destination: (cb) => {
		cb(null, "public/images/");
	},

	filename: (file, cb) => {
		const nameWithoutExt = path.basename(
			file.originalname,

			path.extname(file.originalname),
		);

		const extension = path.extname(file.originalname);

		const timestampphoto = Date.now();

		const finalName = `${nameWithoutExt}-${timestampphoto}${extension}`;

		cb(null, finalName);
	},
});

export const upload = multer({ storage: storage });