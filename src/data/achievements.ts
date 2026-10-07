export interface AchievementItem {
	title: string;
	link?: string;
	rank?: string;
	date?: string;
	place?: string;
	note?: string;
}

export const achievementsData = [
	{
		section: 'Regional Programming Contests',
		items: [
			{
				title: 'ICPC ASIA DHAKA REGIONAL CONTEST 2024',
				link: 'https://bapsoj.org/contests/icpc-asia-dhaka-regional-contest-2024-onsite-round',
				rank: '174',
				date: 'December 7, 2024',
				place: 'Dhaka, Bangladesh',
			},
			{
				title: 'MIAKI PRESENTS KUET IUPC ONSITE 2025',
				link: 'https://bapsoj.org/contests/miaki-presents-kuet-iupc-onsite-2025',
				rank: '119',
				date: 'January 4, 2025',
				place: 'Khulna, Bangladesh',
			},
			{
				title: 'UIU IUPC CONTEST 2025',
				link: 'https://bapsoj.org/contests/uiu-inter-university-programming-contest-2025',
				rank: '116',
				date: 'January 18, 2025',
				place: 'Dhaka, Bangladesh',
			},
			{
				title: 'MTB Presents AUST IUPC 2025',
				link: 'https://toph.co/c/mtb-presents-aust-inter-university-2025',
				rank: '86',
				date: 'February 22, 2025',
				place: 'Dhaka, Bangladesh',
			},
			{
				title: 'BUBT IUCPC 2025',
				link: 'https://toph.co/c/bubt-inter-university-collaborative',
				rank: '36',
				date: 'November 29, 2025',
				place: 'Dhaka, Bangladesh',
			},
		],
	},
	{
		section: 'University Contest',
		items: [
			{
				title: 'Inter-University Beginners Programming Contest 2024',
				rank: 'Champion',
			},
			{
				title: 'Inter Departmental Programming Contest 2024',
				rank: 'Champion',
				date: 'October 4, 2024',
				place: 'Green University of Bangladesh',
			},
		],
	},
	{
		section: 'Hackathon',
		items: [
			{
				title: 'PSTU Hackathon',
				rank: 'Top 50 Finalist',
				note: '200+ competitors',
			},
		],
	},
];
