import { Color } from "@/constants/theme";
import { Platform, StatusBar, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Color.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Color.border
    },

    iconBtn: {
        padding: 4,
    },

    navTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Color.black1,
        letterSpacing: -0.2,
        flex: 1,
    },

    restoreBtn: {
        padding: 4,
    },

    restoreBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Color.purple
    },

    scrollContainer: {
        padding: 12,
        paddingBottom: 40,
    },

    disclaimerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#EEF2FF',
        borderColor: Color.purple,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 12,
        gap: 6,
    },

    disclaimerText: {
        fontSize: 11,
        fontWeight: '700',
        color: Color.purple,
    },

    auditBox: {
        backgroundColor: Color.lightBackground,
        borderWidth: 1,
        borderColor: Color.border,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },

    auditHeader: {
        fontSize: 11,
        fontWeight: '700',
        color: Color.black,
        textTransform: 'uppercase',
        marginBottom: 8,
    },

    auditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    auditKey: {
        fontSize: 12,
        color: Color.lightBlack,
        fontWeight: '500',
    },

    auditVal: {
        fontSize: 12,
        fontWeight: '700',
        color: Color.lightBlack,
    },

    auditValSmall: {
        fontSize: 11,
        color: Color.lightBlack,
    },

    pendingColor: {
        color: Color.warning
    },

    activeColor: {
        color: Color.green,
    },

    inactiveColor: {
        color: '#64748B',
    },

    logContainer: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: Color.border
    },

    logText: {
        fontSize: 12,
        color: Color.lightBlack,
        fontStyle: 'italic',
    },

    honestPendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },

    honestPendingTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
    },

    honestPendingSub: {
        fontSize: 11.5,
        color: '#B45309',
        marginTop: 2,
        lineHeight: 16,
    },

    activeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },

    activeTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#065F46',
    },

    activeSub: {
        fontSize: 11.5,
        color: '#047857',
        marginTop: 1,
    },

    productCard: {
        backgroundColor: Color.white,
        borderWidth: 2,
        borderColor: Color.purple,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        shadowColor: Color.purple,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    productTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: Color.black
    },

    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: Color.purple
    },

    divider: {
        height: 1,
        backgroundColor: Color.border,
        marginVertical: 12,
    },

    benefitsList: {
        rowGap: 4,
    },

    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    benefitText: {
        fontSize: 13,
        color: Color.lightBlack,
        fontWeight: '500',
    },

    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: Color.black,
        textTransform: 'uppercase',
        marginBottom: 10,
    },

    actionBtn: {
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    btnDisabled: {
        opacity: 0.55,
    },

    primaryBtn: {
        backgroundColor: Color.purple
    },

    btnText: {
        fontSize: 14,
        fontWeight: '700',
        color: Color.white
    },

    warningBtn: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: Color.warning,
    },

    warningBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Color.warning,
    },

    secondaryBtn: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },

    secondaryBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },

    dangerBtn: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: Color.red,
    },

    dangerBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Color.red,
    },

    resetBtn: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 6,
    },

    resetBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Color.lightBlack,
        textDecorationLine: 'underline',
    },
});

export default styles;